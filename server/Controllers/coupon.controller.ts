import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@/generated/prisma/client";
import { ArgsStructure } from "./category.controller";
import { normalizeCouponCode } from "../utils/coupon";

const couponBase = z.object({
  code: z
    .string()
    .trim()
    .min(3)
    .max(32)
    .regex(/^[A-Za-z0-9_-]+$/, "کد فقط شامل حروف انگلیسی، عدد، - و _ باشد"),
  type: z.enum(["FREE_SHIPPING", "PERCENT", "FIXED"]),
  value: z.number().int().min(0),
  isActive: z.boolean(),
  expiresAt: z.string().datetime().nullable(),
  minSubtotal: z.number().int().positive().nullable(),
  usageLimit: z.number().int().positive().nullable(),
});

type CouponFields = z.infer<typeof couponBase>;

function refineCouponValue(coupon: CouponFields, ctx: z.RefinementCtx) {
  if (coupon.type === "PERCENT" && (coupon.value < 1 || coupon.value > 100)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["value"],
      message: "درصد تخفیف باید بین ۱ تا ۱۰۰ باشد",
    });
  }
  if (coupon.type === "FIXED" && coupon.value < 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["value"],
      message: "مبلغ تخفیف را وارد کنید",
    });
  }
}

function toCouponData(input: CouponFields) {
  return {
    code: normalizeCouponCode(input.code),
    type: input.type,
    value: input.type === "FREE_SHIPPING" ? 0 : input.value,
    isActive: input.isActive,
    expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    minSubtotal: input.minSubtotal,
    usageLimit: input.usageLimit,
  };
}

function rethrowDuplicateCode(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "این کد قبلاً ثبت شده است",
    });
  }
  throw error;
}

export async function listCouponsController({ ctx }: ArgsStructure) {
  const coupons = await ctx.prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });
  return { coupons };
}

export const createCouponInput = couponBase.superRefine(refineCouponValue);

export async function createCouponController({
  ctx,
  input,
}: ArgsStructure<CouponFields>) {
  try {
    const coupon = await ctx.prisma.coupon.create({
      data: toCouponData(input),
    });
    return { coupon };
  } catch (error) {
    rethrowDuplicateCode(error);
  }
}

export const updateCouponInput = couponBase
  .extend({ id: z.number().int() })
  .superRefine(refineCouponValue);

export async function updateCouponController({
  ctx,
  input,
}: ArgsStructure<z.infer<typeof updateCouponInput>>) {
  try {
    const coupon = await ctx.prisma.coupon.update({
      where: { id: input.id },
      data: toCouponData(input),
    });
    return { coupon };
  } catch (error) {
    rethrowDuplicateCode(error);
  }
}

export const setCouponActiveInput = z.object({
  id: z.number().int(),
  isActive: z.boolean(),
});

export async function setCouponActiveController({
  ctx,
  input,
}: ArgsStructure<z.infer<typeof setCouponActiveInput>>) {
  const coupon = await ctx.prisma.coupon.update({
    where: { id: input.id },
    data: { isActive: input.isActive },
  });
  return { coupon };
}
