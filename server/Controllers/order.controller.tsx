import { z } from "zod";
import { Context } from "../context";
import { estimate_miare_price } from "./shipping/miare.controller";

type ArgsStructure<T = null> = T extends null
  ? {
      ctx: Context;
    }
  : {
      ctx: Context;
      input: T;
    };

export const activeOrderInputSchema = z.object({
  selectedProducts: z.array(
    z
      .object({
        productId: z.number(),
        variationId: z.number().optional(),
        variationValueId: z.number().optional(),
        numberOfProduct: z.number(),
      })
      .optional()
  ),
  shippingInfo: z
    .object({
      shippingPartnerId: z.number(),
    })
    .optional(),
});

type ActiveOrderInput = z.infer<typeof activeOrderInputSchema>;

export async function updateActiveOrderController({
  ctx,
  input,
}: ArgsStructure<ActiveOrderInput>) {
  const { prisma, user } = ctx;

  try {
    const findActiveOrder = await prisma.order.findFirst({
      where: {
        status: "ACTIVE",
        userId: user.userId,
      },
      include: {
        Address: {
          select: {
            latitude: true,
            longitude: true,
          },
        },
        ProductForOrder: {
          include: {
            ProductVariationValue: true,
            Product: true,
          },
        },
      },
    });

    if (!input.shippingInfo) {
      let activeOrder = await prisma.order.upsert({
        where: {
          id: findActiveOrder?.id || -1,
        },
        create: {
          status: "ACTIVE",
          user: {
            connect: {
              id: user.userId,
            },
          },
          ProductForOrder: {
            create: input.selectedProducts.map((prOrder) =>
              prOrder?.variationId && prOrder?.variationValueId
                ? {
                    productId: prOrder.productId,
                    productVariationId: prOrder.variationId,
                    productVariationValueId: prOrder.variationValueId,
                    numberOfproduct: prOrder.numberOfProduct,
                  }
                : {
                    productId: prOrder.productId,
                    numberOfproduct: prOrder.numberOfProduct,
                  }
            ),
          },
        },
        update: {
          ProductForOrder: {
            deleteMany: { orderId: findActiveOrder?.id },
            create: input.selectedProducts.map((prOrder) =>
              prOrder?.variationId && prOrder?.variationValueId
                ? {
                    productId: prOrder.productId,
                    productVariationId: prOrder.variationId,
                    productVariationValueId: prOrder.variationValueId,
                    numberOfproduct: prOrder.numberOfProduct,
                  }
                : {
                    productId: prOrder.productId,
                    numberOfproduct: prOrder.numberOfProduct,
                  }
            ),
          },
        },
        include: {
          ProductForOrder: {
            include: {
              Product: {
                select: {
                  imageNames: true,
                  name: true,
                  price: true,
                  id: true,
                },
              },
              ProductVariationValue: {
                select: {
                  name: true,
                  price: true,
                },
              },
            },
          },
        },
      });

      const addProductImages = {
        ...activeOrder,
        ProductForOrder: activeOrder.ProductForOrder.map((e) => ({
          ...e,
          Product: {
            ...e.Product,
            imageUrls: e.Product.imageNames.map(
              (imgName) =>
                `${process.env.NEXT_PUBLIC_STATIC_FILES_ENDPOINT}/productImages/${imgName}`
            ),
          },
        })),
      };
      let totalPrice: number = 0;
      for (let pr of activeOrder.ProductForOrder) {
        if (pr.ProductVariationValue?.price) {
          totalPrice += pr.ProductVariationValue.price * pr.numberOfproduct;
        } else if (!pr.ProductVariationValue?.price) {
          totalPrice += pr.Product.price * pr.numberOfproduct;
        }
      }
      return {
        result: "ok",
        activeOrder: addProductImages,
        price: { totalPrice, shippingPrice: 0, finalPrice: null },
        error: null,
      };
    }

    if (input.shippingInfo?.shippingPartnerId && findActiveOrder) {
      let totalPrice: number = 0;
      for (let pr of findActiveOrder.ProductForOrder) {
        if (pr.ProductVariationValue?.price) {
          totalPrice += pr.ProductVariationValue.price * pr.numberOfproduct;
        } else if (!pr.ProductVariationValue?.price) {
          totalPrice += pr.Product.price * pr.numberOfproduct;
        }
      }
      if (
        input.shippingInfo?.shippingPartnerId === 1 &&
        findActiveOrder?.Address?.latitude
      ) {
        const coordinateBody = {
          origin: {
            latitude: Number(process.env.STORE_LATITUDE) as number,
            longitude: Number(process.env.STORE_LONGITUDE) as number,
          },
          destination: {
            latitude: findActiveOrder?.Address?.latitude,
            longitude: findActiveOrder?.Address?.longitude,
          },
        };
        const miare = await estimate_miare_price(coordinateBody);
        try {
          const updateOrderShipping = await prisma.order.update({
            where: {
              id: findActiveOrder?.id,
            },
            data: {
              shippingPartnerId: input.shippingInfo.shippingPartnerId,
              finalPrice: (miare.price as number) + totalPrice,
              OrderShipping: {
                upsert: {
                  where: {
                    orderId: findActiveOrder?.id || -1,
                  },
                  create: {
                    price: miare.price,
                    shippingPartnerId: input.shippingInfo.shippingPartnerId,
                  },
                  update: {
                    price: miare.price,
                    shippingPartnerId: input.shippingInfo.shippingPartnerId,
                  },
                },
              },
            },
            include: {
              ProductForOrder: {
                include: {
                  Product: {
                    select: {
                      imageNames: true,
                      name: true,
                      price: true,
                      id: true,
                    },
                  },
                  ProductVariationValue: {
                    select: {
                      name: true,
                      price: true,
                    },
                  },
                },
              },
              OrderShipping: {
                select: {
                  price: true,
                },
              },
            },
          });

          const addProductImages = {
            ...updateOrderShipping,
            ProductForOrder: updateOrderShipping.ProductForOrder.map((e) => ({
              ...e,
              Product: {
                ...e.Product,
                imageUrls: e.Product.imageNames.map(
                  (imgName) =>
                    `${process.env.NEXT_PUBLIC_STATIC_FILES_ENDPOINT}/productImages/${imgName}`
                ),
              },
            })),
          };

          return {
            result: "ok",
            activeOrder: addProductImages,
            error: null,
            price: {
              totalPrice,
              shippingPrice: updateOrderShipping.OrderShipping?.price || 0,
              finalPrice:
                totalPrice + (updateOrderShipping.OrderShipping?.price || 0),
            },
          };
        } catch (error) {
          return {
            result: "failed",
            activeOrder: null,
            error,
            price: { totalPrice: null, shippingPrice: null, finalPrice: null },
          };
        }
      }
    }
  } catch (error) {
    return {
      result: "failed",
      activeOrder: null,
      error,
      price: { totalPrice: null, shippingPrice: null, finalPrice: null },
    };
  }
}

export async function getActiveOrderController({ ctx }: ArgsStructure) {
  const { user, prisma } = ctx;
  try {
    const activeOrder = await prisma.order.findFirst({
      where: {
        user: {
          id: user.userId,
        },
        status: "ACTIVE",
      },
      include: {
        ProductForOrder: {
          include: {
            Product: true,
            ProductVariationValue: true,
          },
        },
        OrderShipping: {
          select: {
            price: true,
          },
        },
      },
    });

    if (activeOrder) {
      const addProductImages = {
        ...activeOrder,
        ProductForOrder: activeOrder.ProductForOrder.map((e) => ({
          ...e,
          Product: {
            ...e.Product,
            imageUrls: e.Product.imageNames.map(
              (imgName) =>
                `${process.env.NEXT_PUBLIC_STATIC_FILES_ENDPOINT}/productImages/${imgName}`
            ),
          },
        })),
      };

      let totalPrice: number = 0;
      for (let pr of activeOrder.ProductForOrder) {
        if (pr.ProductVariationValue?.price) {
          totalPrice += pr.ProductVariationValue.price * pr.numberOfproduct;
        } else if (!pr.ProductVariationValue?.price) {
          totalPrice += pr.Product.price * pr.numberOfproduct;
        }
      }
      return {
        result: "ok",
        activeOrder: addProductImages,
        price: {
          totalPrice,
          shippingPrice: activeOrder.OrderShipping?.price || null,
          finalPrice: totalPrice + (activeOrder.OrderShipping?.price || 0),
        },
        error: null,
        message: "",
      };
    }
    return {
      result: "no_order",
      activeOrder: null,
      error: null,
      message: "no active order",
      price: { totalPrice: null, shippingPrice: null, finalPrice: null },
    };
  } catch (error) {
    return {
      result: "error",
      activeOrder: null,
      error,
      price: { totalPrice: null, shippingPrice: null, finalPrice: null },
      message: "",
    };
  }
}
