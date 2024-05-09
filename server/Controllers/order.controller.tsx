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

export const createOrderInputSchema = z.object({
  productId: z.number(),
  productVariationId: z.number().optional(),
  productVariationValueid: z.number().optional(),
  numberOfProduct: z.number(),
});

type CreateOrderInput = z.infer<typeof createOrderInputSchema>;

export async function createOrderController({
  ctx,
  input,
}: ArgsStructure<CreateOrderInput>) {
  const { prisma, user } = ctx;
  try {
    const createdOrder = await prisma.order.create({
      data: {
        status: "ACTIVE",
        user: {
          connect: {
            id: user.userId,
          },
        },
        ProductForOrder: {
          create:
            input?.productVariationId && input?.productVariationValueid
              ? {
                  productId: input.productId,
                  productVariationId: input.productVariationId,
                  productVariationValueId: input.productVariationValueid,
                  numberOfproduct: input.numberOfProduct,
                }
              : {
                  productId: input.productId,
                  numberOfproduct: input.numberOfProduct,
                },
        },
      },
    });

    return { result: "ok", newOrder: createdOrder, error: null };
  } catch (error) {
    return { result: "failed", newOrder: null, error };
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
      include:{
        ProductForOrder: {
          include:{
            Product: true,
            ProductVariationValue: true
          }
        }

      }
    });

    if (activeOrder) {
      return { result: "ok", activeOrder, error: null };
    }
    return {
      result: "no_order",
      activeOrder: null,
      error: null,
      message: "no active order",
    };
  } catch (error) {
    return { result: "error", activeOrder: null, error: error };
  }
}
