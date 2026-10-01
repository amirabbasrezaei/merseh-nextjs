import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import { Context } from "../context";
import {
  firstGalleryImageUrl,
  galleryImageUrls,
  galleryInclude,
} from "../utils/storage";
import { priceOrder, subtotalOf, unitPriceOf } from "../utils/orderPricing";
import { couponRejection, normalizeCouponCode } from "../utils/coupon";
import { CARRIER_NAMES, activeCarrierWhere } from "../utils/shippingCarriers";

type ArgsStructure<T = null> = T extends null
  ? {
      ctx: Context;
    }
  : {
      ctx: Context;
      input: T;
    };

const activeOrderInclude = {
  ProductForOrder: {
    orderBy: { id: "asc" as const },
    include: {
      Product: {
        select: {
          id: true,
          name: true,
          price: true,
          discount: true,
          freeShipping: true,
          ...galleryInclude(),
        },
      },
      ProductVariationValue: {
        select: { id: true, name: true, price: true, discount: true },
      },
    },
  },
  OrderShipping: { include: { ShippingPartner: true } },
  coupon: true,
} satisfies Prisma.OrderInclude;

type ActiveOrder = Prisma.OrderGetPayload<{
  include: typeof activeOrderInclude;
}>;

function badRequest(message: string) {
  return new TRPCError({ code: "BAD_REQUEST", message });
}

function findActiveOrder(prisma: PrismaClient, userId: string) {
  return prisma.order.findFirst({
    where: { status: "ACTIVE", userId },
    include: activeOrderInclude,
  });
}

function isCarrier(name: string) {
  return (CARRIER_NAMES as readonly string[]).includes(name);
}

function evaluateOrder(order: ActiveOrder) {
  const lines = order.ProductForOrder;
  const rejection = order.coupon
    ? couponRejection(order.coupon, subtotalOf(lines))
    : null;
  const coupon = rejection ? null : order.coupon;
  const partner = order.OrderShipping?.ShippingPartner ?? null;
  const shippingPartner =
    partner && partner.isActive && isCarrier(partner.name) ? partner : null;

  return {
    pricing: priceOrder({
      lines,
      coupon,
      shippingPrice: shippingPartner?.price ?? null,
    }),
    coupon,
    shippingPartner,
    couponNotice:
      rejection && order.coupon
        ? `کد «${order.coupon.code}» از سفارش حذف شد. ${rejection}`
        : null,
  };
}

type OrderEvaluation = ReturnType<typeof evaluateOrder>;

function isEvaluationStale(
  order: ActiveOrder,
  { pricing, coupon, shippingPartner }: OrderEvaluation
) {
  return (
    order.couponId !== (coupon?.id ?? null) ||
    order.couponCode !== (coupon?.code ?? null) ||
    order.couponDiscount !== pricing.couponDiscount ||
    order.finalPrice !== pricing.productTotal ||
    (order.shippingPartnerId ?? null) !== (shippingPartner?.id ?? null) ||
    (order.OrderShipping?.price ?? null) !== pricing.shippingCharge
  );
}

function persistEvaluation(
  prisma: PrismaClient,
  order: ActiveOrder,
  { pricing, coupon, shippingPartner }: OrderEvaluation
) {
  const orderShipping = shippingPartner
    ? {
        update: {
          price: pricing.shippingCharge ?? 0,
          name: shippingPartner.name,
          title: shippingPartner.name,
        },
      }
    : order.OrderShipping
      ? { delete: true }
      : undefined;

  return prisma.order.update({
    where: { id: order.id },
    data: {
      finalPrice: pricing.productTotal,
      couponId: coupon?.id ?? null,
      couponCode: coupon?.code ?? null,
      couponDiscount: pricing.couponDiscount,
      shippingPartnerId: shippingPartner?.id ?? null,
      OrderShipping: orderShipping,
    },
    include: activeOrderInclude,
  });
}

function toActiveOrderView(order: ActiveOrder, evaluation: OrderEvaluation) {
  const { pricing, coupon, shippingPartner, couponNotice } = evaluation;

  return {
    result: "ok" as const,
    activeOrder: {
      id: order.id,
      addressId: order.addressId,
      shippingPartnerId: shippingPartner?.id ?? null,
      coupon: coupon
        ? { code: coupon.code, type: coupon.type, value: coupon.value }
        : null,
      items: order.ProductForOrder.map((line) => {
        const unit = unitPriceOf(line);
        return {
          productId: line.productId,
          variationId: line.productVariationId ?? undefined,
          variationValueId: line.productVariationValueId ?? undefined,
          name: line.Product.name,
          variationValueName: line.ProductVariationValue?.name,
          imageUrl: firstGalleryImageUrl(line.Product.galleryFiles),
          price: unit.listPrice,
          discount: unit.discount,
          numberOfProduct: line.numberOfproduct,
          freeShipping: line.Product.freeShipping,
        };
      }),
    },
    price: pricing,
    notice: couponNotice,
  };
}

export type ActiveOrderView = ReturnType<typeof toActiveOrderView>;

/** Recomputes coupon, shipping, and totals from current catalog data and saves them. */
export async function syncActiveOrder(
  prisma: PrismaClient,
  userId: string
): Promise<ActiveOrderView | null> {
  const order = await findActiveOrder(prisma, userId);
  if (!order) return null;

  const evaluation = evaluateOrder(order);
  const saved = await persistEvaluation(prisma, order, evaluation);
  return toActiveOrderView(saved, evaluation);
}

async function requireSyncedOrder(prisma: PrismaClient, userId: string) {
  const view = await syncActiveOrder(prisma, userId);
  if (!view) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "سبد خرید فعالی پیدا نشد.",
    });
  }
  return view;
}

export const activeOrderInputSchema = z.object({
  selectedProducts: z.array(
    z.object({
      productId: z.number().int(),
      variationId: z.number().int().optional(),
      variationValueId: z.number().int().optional(),
      numberOfProduct: z.number().int(),
    })
  ),
});

type ActiveOrderInput = z.infer<typeof activeOrderInputSchema>;

function toOrderLines(products: ActiveOrderInput["selectedProducts"]) {
  return products
    .filter((product) => product.numberOfProduct > 0)
    .map((product) => ({
      productId: product.productId,
      numberOfproduct: product.numberOfProduct,
      ...(product.variationId && product.variationValueId
        ? {
            productVariationId: product.variationId,
            productVariationValueId: product.variationValueId,
          }
        : {}),
    }));
}

export async function updateActiveOrderController({
  ctx,
  input,
}: ArgsStructure<ActiveOrderInput>) {
  const { prisma, user } = ctx;
  const lines = toOrderLines(input.selectedProducts);
  const existing = await prisma.order.findFirst({
    where: { status: "ACTIVE", userId: user.userId },
    select: { id: true },
  });

  if (existing) {
    await prisma.order.update({
      where: { id: existing.id },
      data: { ProductForOrder: { deleteMany: {}, create: lines } },
    });
  } else {
    await prisma.order.create({
      data: {
        status: "ACTIVE",
        userId: user.userId,
        ProductForOrder: { create: lines },
      },
    });
  }

  return requireSyncedOrder(prisma, user.userId);
}

export async function getActiveOrderController({ ctx }: ArgsStructure) {
  const { prisma, user } = ctx;
  const order = await findActiveOrder(prisma, user.userId);
  if (!order) {
    return {
      result: "no_order" as const,
      activeOrder: null,
      price: null,
      notice: null,
    };
  }

  const evaluation = evaluateOrder(order);
  if (!isEvaluationStale(order, evaluation)) {
    return toActiveOrderView(order, evaluation);
  }
  const saved = await persistEvaluation(prisma, order, evaluation);
  return toActiveOrderView(saved, evaluation);
}

export const selectShippingInputSchema = z.object({
  addressId: z.string().min(1),
  shippingPartnerId: z.string().min(1),
});

export async function selectShippingController({
  ctx,
  input,
}: ArgsStructure<z.infer<typeof selectShippingInputSchema>>) {
  const { prisma, user } = ctx;
  const [order, address, partner] = await Promise.all([
    prisma.order.findFirst({
      where: { status: "ACTIVE", userId: user.userId },
      select: { id: true },
    }),
    prisma.address.findFirst({
      where: { id: input.addressId, userId: user.userId },
      select: { id: true },
    }),
    prisma.shippingPartner.findFirst({
      where: { id: input.shippingPartnerId, ...activeCarrierWhere },
    }),
  ]);

  if (!order) throw badRequest("سبد خرید فعالی پیدا نشد.");
  if (!address) throw badRequest("آدرس انتخاب‌شده معتبر نیست.");
  if (!partner) throw badRequest("این روش ارسال در دسترس نیست.");

  const shipping = {
    shippingPartnerId: partner.id,
    name: partner.name,
    title: partner.name,
    price: partner.price,
  };
  await prisma.order.update({
    where: { id: order.id },
    data: {
      addressId: address.id,
      OrderShipping: { upsert: { create: shipping, update: shipping } },
    },
  });

  return requireSyncedOrder(prisma, user.userId);
}

export const applyCouponInputSchema = z.object({
  code: z.string().trim().min(1).max(64),
});

export async function applyCouponController({
  ctx,
  input,
}: ArgsStructure<z.infer<typeof applyCouponInputSchema>>) {
  const { prisma, user } = ctx;
  const order = await findActiveOrder(prisma, user.userId);
  if (!order?.ProductForOrder.length) {
    throw badRequest("سبد خرید شما خالی است.");
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code: normalizeCouponCode(input.code) },
  });
  const rejection = couponRejection(coupon, subtotalOf(order.ProductForOrder));
  if (rejection !== null || !coupon) {
    throw badRequest(rejection ?? "کد تخفیف معتبر نیست.");
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { couponId: coupon.id },
  });

  return requireSyncedOrder(prisma, user.userId);
}

export async function removeCouponController({ ctx }: ArgsStructure) {
  const { prisma, user } = ctx;
  await prisma.order.updateMany({
    where: { status: "ACTIVE", userId: user.userId },
    data: { couponId: null, couponCode: null, couponDiscount: 0 },
  });

  return requireSyncedOrder(prisma, user.userId);
}

export async function ordersController({ ctx }: ArgsStructure) {
  const { prisma, user } = ctx;
  try {
    const isAdmin = user?.role === "ADMIN";
    const orders = await prisma.order.findMany({
      where: isAdmin ? undefined : { userId: user.userId },
      include: {
        ProductForOrder: {
          select: {
            Product: { include: galleryInclude() },
            numberOfproduct: true,
            ProductVariationValue: true,
          },
        },
        user: { select: { name: true, phoneNumber: true } },
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
            latitude: true,
            longitude: true,
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
          imageUrl: firstGalleryImageUrl(prForOrder.Product.galleryFiles),
          imageUrls: galleryImageUrls(prForOrder.Product.galleryFiles),
          imageNames: galleryImageUrls(prForOrder.Product.galleryFiles),
        },
      })),
    }));

    return { orders: ordersWithImageUrl, error: null };
  } catch (error) {
    return { orders: [], error: "error fiding user orders" };
  }
}
