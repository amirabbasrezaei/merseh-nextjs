import { z } from "zod";
import { Context } from "../../context";
import axios from "axios";
import { TRPCError } from "@trpc/server";
import { sendSMSCodeController } from "../sms.controller";

const BASE_URL = "https://gateway.zibal.ir";

type PaymentRouterArgsController<T = null> = T extends null
  ? {
      ctx: Context;
    }
  : {
      ctx: Context;
      input: T;
    };

export const createPaymentSchemaZibal = z.object({
  orderId: z.number(),
});
type CreatePaymentPayloadZibal =
  | {
      pay_link?: string;
      message?: string;
    }
  | any;

export type CreatePaymentZibal = z.infer<typeof createPaymentSchemaZibal>;

export async function createPaymentControllerZibal({
  ctx,
  input,
}: PaymentRouterArgsController<CreatePaymentZibal>) {
  const { user, prisma } = ctx;

  try {
    const findOrder = await prisma.order.findUnique({
      where: {
        id: input.orderId,
      },
      include: {
        OrderShipping: true,
      },
    });
    console.log(findOrder?.OrderShipping?.price);
    const body = {
      merchant: process.env.ZIBAL_MERCHANT_CODE as string,
      amount:
        (findOrder?.finalPrice || 0) * 10 +
        (findOrder?.OrderShipping?.price || 0) * 10,
      callbackUrl:
        process.env.NODE_ENV === "production"
          ? "https://merseh.com/payment"
          : "http://localhost:3000/payment",
      mobile: user.phoneNumber,
      description: "",
      feeMode: 2,
      linkToPay: true,
      orderId: String(input.orderId),
    };

    const { data } = await axios.post(`${BASE_URL}/v1/request`, body);

    if (data) {
      try {
        const updatedPayment = await ctx.prisma.payment.create({
          data: {
            userId: user.userId,
            value: findOrder?.finalPrice || 0,
            orderId: input.orderId,
            trackId: String(data.trackId),
          },
        });
        return { pay_link: `${BASE_URL}/start/${data.trackId}`, error: null };
      } catch (error) {
        return { pay_link: null, error };
      }
    }

    return { pay_link: `${BASE_URL}/start/${data.trackId}`, error: null };
  } catch (error) {
    return { pay_link: null, error };
  }
}

export const inquiryPaymentSchemaZibal = z.object({
  order_id: z.string().optional(),
  track_id: z.string(),
  servicePaymentId: z.string().optional(),
});

type InquiryPaymentPayloadZibal = {
  paymentStatus: "PAYED" | "FAILED" | "WAITING" | "UNKNOWN";
  message: string | null;
  error: any;
};

export type InquiryPayment = z.infer<typeof inquiryPaymentSchemaZibal>;
export async function inquiryPaymentControllerZibal({
  input,
  ctx,
}: PaymentRouterArgsController<InquiryPayment>): Promise<InquiryPaymentPayloadZibal> {
  const { user, prisma } = ctx;

  const verifyBody = {
    merchant: process.env.ZIBAL_MERCHANT_CODE as string,
    trackId: Number(input.track_id),
  };

  try {
    const verifyTransaction = await axios.post(
      `${BASE_URL}/v1/verify`,
      verifyBody
    );
    console.log(verifyTransaction.data);
    const findOrder = await prisma.order.findFirst({
      where: {
        Payment: {
          some: {
            trackId: input.track_id,
          },
        },
      },
      include: {
        ProductForOrder: true,
      },
    });

    if (findOrder) {
      if (verifyTransaction.data.result == 100) {
        const body = {
          from: "50004001338886",
          to: "09038338886",
          text: "یک خرید انجام شد",
        };
        const { data } = await axios.post(
          "https://console.melipayamak.com/api/send/simple/67798f12b16441749c66f2a10ae881af",
          body
        );
        console.log(data);
        try {
          console.log(findOrder.ProductForOrder);
          await prisma.$transaction([
            prisma.payment.update({
              where: {
                trackId: input.track_id,
              },
              data: {
                cardNumber: verifyTransaction.data.cardNumber || "",
                isPayed: true,
                payment_success_date: new Date(verifyTransaction.data.paidAt),
                paymentDescription: "با موفقیت تایید شد.",
                status: verifyTransaction.data.status,
              },
            }),
            prisma.order.update({
              where: {
                id: findOrder.id,
              },
              data: { status: "PAYED" },
            }),
          ]);
        } catch (error) {
          console.log(error);
        }

        return {
          paymentStatus: "PAYED",
          message: "پرداخت موفقیت آمیز بود.",
          error: null,
        };
      }

      if (verifyTransaction.data.result == 102) {
        await prisma.payment.update({
          where: {
            trackId: input.track_id,
          },
          data: {
            cardNumber: verifyTransaction.data.cardNumber,
            isPayed: false,
            paymentDescription: "merchantیافت نشد.",
            status: verifyTransaction.data.status,
          },
        });
        return {
          paymentStatus: "FAILED",
          message: "پرداخت موفقیت آمیز نبود",
          error: null,
        };
      }

      if (verifyTransaction.data.result == 103) {
        await prisma.payment.update({
          where: {
            trackId: input.track_id,
          },
          data: {
            cardNumber: verifyTransaction.data.cardNumber,
            isPayed: false,
            paymentDescription: "merchantغیرفعال",
            status: verifyTransaction.data.status,
          },
        });
        return {
          paymentStatus: "FAILED",
          message: "پرداخت موفقیت آمیز نبود",
          error: null,
        };
      }

      if (verifyTransaction.data.result == 104) {
        await prisma.payment.update({
          where: {
            trackId: input.track_id,
          },
          data: {
            cardNumber: verifyTransaction.data.cardNumber,
            isPayed: false,
            paymentDescription: "merchantنامعتبر",
            status: verifyTransaction.data.status,
          },
        });
        return {
          paymentStatus: "FAILED",
          message: "پرداخت موفقیت آمیز نبود",
          error: null,
        };
      }
      if (verifyTransaction.data.result == 201) {
        await prisma.payment.update({
          where: {
            trackId: input.track_id,
          },
          data: {
            cardNumber: verifyTransaction.data.cardNumber,
            paymentDescription: "قبلا تایید شده",
            status: verifyTransaction.data.status,
          },
        });
        return {
          paymentStatus: "PAYED",
          message: "قبلا پرداخت انجام شده است.",
          error: null,
        };
      }
      if (verifyTransaction.data.result == 202) {
        await prisma.payment.update({
          where: {
            trackId: input.track_id,
          },
          data: {
            cardNumber: verifyTransaction.data.cardNumber,
            isPayed: false,
            paymentDescription: "سفارش پرداخت نشده یا ناموفق بوده است.",
            status: verifyTransaction.data.status,
          },
        });
        return {
          paymentStatus: "FAILED",
          message: "پرداخت موفقیت آمیز نبود",
          error: null,
        };
      }
      if (verifyTransaction.data.result == 203) {
        const res = await prisma.payment.update({
          where: {
            trackId: input.track_id,
          },
          data: {
            cardNumber: verifyTransaction.data.cardNumber,
            isPayed: false,
            paymentDescription: "trackIdنامعتبر می‌باشد.",
            status: verifyTransaction.data.status,
          },
        });

        return {
          paymentStatus: "FAILED",
          message: "پرداخت موفقیت آمیز نبود",
          error: null,
        };
      }
    }

    return {
      paymentStatus: "UNKNOWN",
      message: "نتیجه تراکنش نامشخص است",
      error: null,
    };
  } catch (error) {
    return {
      paymentStatus: "FAILED",
      message: "پرداخت موفقیت آمیز نبود",
      error,
    };
  }
}
