import { z } from "zod";
import { Context } from "../context";

type ArgsStructure<T = null> = T extends null
  ? {
      ctx: Context;
    }
  : {
      ctx: Context;
      input: T;
    };

export const activeOrderInputSchema = z.array(
  z.object({
    productId: z.number(),
    variationId: z.number().optional(),
    variationValueId: z.number().optional(),
    numberOfProduct: z.number(),
  })
);

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
    });

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
          create: input.map((prOrder) =>
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
          create: input.map((prOrder) =>
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

    let totalPrice: number = 0;
    for (let pr of activeOrder.ProductForOrder) {
      if (pr.ProductVariationValue?.price) {
        totalPrice += pr.ProductVariationValue.price;
      } else if (!pr.ProductVariationValue?.price) {
        totalPrice += pr.Product.price;
      }
    }

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

    return {
      result: "ok",
      activeOrder: addProductImages,
      price: { totalPrice },
      error: null,
    };
  } catch (error) {
    return { result: "failed", activeOrder: null, error, price: {} };
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
          totalPrice += pr.ProductVariationValue.price;
        } else if (!pr.ProductVariationValue?.price) {
          totalPrice += pr.Product.price;
        }
      }

      return {
        result: "ok",
        activeOrder: addProductImages,
        price: { totalPrice },
        error: null,
        message: "",
      };
    }
    return {
      result: "no_order",
      activeOrder: null,
      error: null,
      message: "no active order",
      price: {},
    };
  } catch (error) {
    return {
      result: "error",
      activeOrder: null,
      error,
      price: {},
      message: "",
    };
  }
}
