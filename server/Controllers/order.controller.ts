import { z } from "zod";
import { Context } from "../context";
import { estimate_miare_price } from "./shipping/miare.controller";
import { getShippingPricesController } from "./shipping.controller";

type ArgsStructure<T = null> = T extends null
  ? {
      ctx: Context;
    }
  : {
      ctx: Context;
      input: T;
    };

export const activeOrderInputSchema = z.object({
  selectedProducts: z
    .array(
      z.object({
        productId: z.number(),
        variationId: z.number().optional(),
        variationValueId: z.number().optional(),
        numberOfProduct: z.number(),
      })
    )
    .optional(),
  shippingInfo: z
    .object({
      shippingPartnerName: z.string(),
      addressId: z.string(),
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
            id: true,
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
            create: input.selectedProducts?.length
              ? input.selectedProducts.map((prOrder) =>
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
                )
              : [],
          },
        },
        update: {
          podroRequestId: null,
          ProductForOrder: {
            deleteMany: { orderId: findActiveOrder?.id },
            create: input.selectedProducts?.length
              ? input.selectedProducts.map((prOrder) =>
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
                )
              : [],
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
                  discount: true,
                },
              },
              ProductVariationValue: {
                select: {
                  name: true,
                  price: true,
                  discount: true,
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

      // calculate final price
      let totalPrice: number = 0;
      for (let pr of activeOrder.ProductForOrder) {
        if (pr.ProductVariationValue?.price) {
          totalPrice +=
            (pr.ProductVariationValue.price -
              pr.ProductVariationValue.discount) *
            pr.numberOfproduct;
        } else {
          totalPrice +=
            (pr.Product.price - pr.Product.discount) * pr.numberOfproduct;
        }
      }
      await prisma.order.update({
        where: {
          id: activeOrder.id,
        },
        data: {
          finalPrice: totalPrice,
        },
      });
      return {
        result: "ok",
        activeOrder: addProductImages,
        price: { totalPrice, shippingPrice: null, finalPrice: null },
        error: null,
      };
    }

    if (findActiveOrder) {
      // calculate final price
      let totalPrice: number = 0;
      for (let pr of findActiveOrder.ProductForOrder) {
        if (pr.ProductVariationValue?.price) {
          totalPrice +=
            (pr.ProductVariationValue.price -
              pr.ProductVariationValue.discount) *
            pr.numberOfproduct;
        } else {
          totalPrice +=
            (pr.Product.price - pr.Product.discount) * pr.numberOfproduct;
        }
      }
      await prisma.order.update({
        where: { id: findActiveOrder?.id },
        data: {
          finalPrice: totalPrice,
        },
      });

      if (input.shippingInfo?.shippingPartnerName) {
        try {
          let choosenShipping: any;
          if (findActiveOrder.Address?.id) {
            const { shippings } = await getShippingPricesController({
              ctx,
              input: {
                orderId: findActiveOrder.id,
                addressId: input.shippingInfo.addressId,
              },
            });
            shippings?.map((shippingType) => {
              shippingType.shippingPartners.map((shippingPartner: any) => {
                if (
                  shippingPartner.name ==
                  input.shippingInfo?.shippingPartnerName
                ) {
                  choosenShipping = shippingPartner;
                }
              });
            });
          }

          try {
            if (choosenShipping?.shippingPartnerId) {
              const updateOrderShipping = await prisma.order.update({
                where: {
                  id: findActiveOrder?.id,
                },
                data: {
                  OrderShipping: {
                    upsert: {
                      where: {
                        orderId: findActiveOrder?.id || -1,
                      },
                      create: {
                        price: Number(choosenShipping.price),
                        name: choosenShipping.name,
                        title: choosenShipping.title,
                      },
                      update: {
                        price: Number(choosenShipping.price),
                        name: choosenShipping.name,
                        title: choosenShipping.title,
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
                ProductForOrder: updateOrderShipping.ProductForOrder.map(
                  (e) => ({
                    ...e,
                    Product: {
                      ...e.Product,
                      imageUrls: e.Product.imageNames.map(
                        (imgName) =>
                          `${process.env.NEXT_PUBLIC_STATIC_FILES_ENDPOINT}/productImages/${imgName}`
                      ),
                    },
                  })
                ),
              };

              return {
                result: "ok",
                activeOrder: addProductImages,
                error: null,
                price: {
                  totalPrice,
                  shippingPrice: updateOrderShipping.OrderShipping?.price || 0,
                  finalPrice:
                    totalPrice +
                    (updateOrderShipping.OrderShipping?.price || 0),
                },
              };
            }
          } catch (error) {
            console.log(error);
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

      // calculate final price
      let totalPrice: number = 0;
      for (let pr of activeOrder.ProductForOrder) {
        if (pr.ProductVariationValue?.price) {
          totalPrice +=
            (pr.ProductVariationValue.price -
              pr.ProductVariationValue.discount) *
            pr.numberOfproduct;
        } else {
          totalPrice +=
            (pr.Product.price - pr.Product.discount) * pr.numberOfproduct;
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

export async function ordersController({ ctx }: ArgsStructure) {
  const { prisma, user } = ctx;
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: user.userId,
      },
      include: {
        ProductForOrder: {
          select: {
            Product: true,
            numberOfproduct: true,
            ProductVariationValue: true,
          },
        },
        Address: {
          select: {
            addressDetails: true,
            city: true,
            title: true,
            Province: true,
            reciverName: true,
            reciverFamilyName: true,
            reciverPhoneNumber: true,
            postalCode: true,
          },
        },
      },
    });
    const ordersWithImageUrl = orders.map((order) => ({
      ...order,
      Address: {
        ...order.Address,
        postalCode: order.Address?.postalCode?.toString(),
      },
      ProductForOrder: order.ProductForOrder.map((prForOrder) => ({
        ...prForOrder,
        Product: {
          ...prForOrder.Product,
          imageUrl: `${process.env.NEXT_PUBLIC_STATIC_FILES_ENDPOINT}/productImages/${prForOrder.Product.imageNames[0]}`,
        },
      })),
    }));

    return { orders: ordersWithImageUrl, error: null };
  } catch (error) {
    return { orders: [], error: "error fiding user orders" };
  }
}
