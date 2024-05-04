import { z } from "zod";
import { Context } from "../../context";
import axios from "axios";
import { TRPCError } from "@trpc/server";

const BASE_URL = `https://api.idpay.ir/v1.1`;

const HEADERS = {
  headers: {
    "X-API-KEY": process.env.IDPAY_TOKEN,
    // "X-SANDBOX": true,
  },
};

type PaymentRouterArgsController<T = null> = T extends null
  ? {
      ctx: Context;
    }
  : {
      ctx: Context;
      input: T;
    };

export const createPaymentSchema = z.object({
  amount: z.number(),
});

type CreatePaymentPayload =
  | {
      pay_link?: string;
      message?: string;
    }
  | any;

export type CreatePayment = z.infer<typeof createPaymentSchema>;
export async function createPaymentController({
  input,
  ctx,
}: PaymentRouterArgsController<CreatePayment>): Promise<CreatePaymentPayload> {
  const { user, prisma } = ctx;

  const findUser = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
  });
  if (!findUser) {
    return new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "کاربر وجود ندارد",
    });
  }

  try {
    const payment = await ctx.prisma.payment.create({
      data: {
        userId: user.userId,
        value: input.amount * 10,
      },
    });
    const body = {
      order_id: payment.id,
      callback: "https://zipway.ir/payment",
      phone: findUser.phoneNumber,
      mail: "zipwaysupp@gmail.com",
      name: findUser.name,
      desc: "",
      amount: input.amount * 10,
    };
    const { data } = await axios.post(`${BASE_URL}/payment`, body, HEADERS);
    if (data) {
      const updatedPayment = await ctx.prisma.payment.update({
        data: {
          servicePaymentId: data.id,
        },
        where: {
          id: payment.id,
        },
      });
      console.log(updatedPayment);
    }

    return { pay_link: data.link };
  } catch (error) {
    console.log(error);
    return new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "مشکل ارتباط با سرویس پرداخت",
    });
  }
}

export const inquiryPaymentSchema = z.object({
  servicePaymentId: z.string(),
  order_id: z.string(),
  track_id: z.string(),
});

type InquiryPaymentPayload =
  | { paymentStatus: "PAYED" | "FAILED" | "WAITING"; message: string | null }
  | TRPCError;

export type InquiryPayment = z.infer<typeof inquiryPaymentSchema>;
export async function inquiryPaymentController({
  input,
  ctx,
}: PaymentRouterArgsController<InquiryPayment>): Promise<InquiryPaymentPayload> {
  const { user, prisma } = ctx;

  const findUser = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
  });
  if (!findUser) {
    return new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "کاربر وجود ندارد",
    });
  }

  const inquiryBody = {
    id: input.servicePaymentId,
    order_id: input.order_id,
  };

  try {
    const inquiryResponse = await axios.post(
      `${BASE_URL}/payment/inquiry`,
      inquiryBody,
      HEADERS
    );
    
    if (inquiryResponse.data.status == 10) {
      const verifyPaymentBody = {
        id: input.servicePaymentId,
        order_id: input.order_id,
      };
      console.log(inquiryResponse.data);
      try {
        const verifyPaymentResponse = await axios.post(
          `${BASE_URL}/payment/verify`,
          verifyPaymentBody,
          HEADERS
        );
        console.log(verifyPaymentResponse.data);
        if (verifyPaymentResponse?.data?.verify?.date) {
          await prisma.payment.update({
            where: {
              servicePaymentId: input.servicePaymentId,
            },
            data: {
              isPayed: true,
              payment_success_date: new Date(Date.now()),
            },
          });
          await prisma.user.update({
            where: {
              id: user.userId,
            },
            data: {
              credit: {
                increment: Number(inquiryResponse.data.amount),
              },
            },
          });
          return {
            paymentStatus: "PAYED",
            message: "پرداخت موفقیت آمیز بود و کیف پول شما شارژ شد.",
          };
        }
        return {
          paymentStatus: "FAILED",
          message: "پرداخت انجام شده ولی تائید تراکنش بت خطا مواجه شد",
        };
      } catch (error) {
        console.log(error);
      }
    }
    if(inquiryResponse.data.status == '1') {
      return {
        paymentStatus: "WAITING",
        message: "پرداخت انجام نشده است",
      };
    }
    if(inquiryResponse.data.status == '2') {
      return {
        paymentStatus: "FAILED",
        message: "پرداخت ناموفق بوده است",
      };
    }
    if(inquiryResponse.data.status == '3') {
      return {
        paymentStatus: "FAILED",
        message: "خطا رخ داده است",
      };
    }
    if(inquiryResponse.data.status == '4') {
      return {
        paymentStatus: "FAILED",
        message: "بلوکه شده",
      };
    }
    if(inquiryResponse.data.status == '5') {
      return {
        paymentStatus: "FAILED",
        message: "برگشت به پرداخت کننده",
      };
    }
    if(inquiryResponse.data.status == '6') {
      return {
        paymentStatus: "FAILED",
        message: "برگشت خورده سیستمی",
      };
    }
    if(inquiryResponse.data.status == '7') {
      return {
        paymentStatus: "FAILED",
        message: "انصراف از پرداخت",
      };
    }
    if(inquiryResponse.data.status == '8') {
      return {
        paymentStatus: "WAITING",
        message: "به درگاه پرداخت منتقل شد",
      };
    }
    if(inquiryResponse.data.status == '100') {
      return {
        paymentStatus: "PAYED",
        message: "پرداخت تایید شده است",
      };
    }
    if(inquiryResponse.data.status == '101') {
      return {
        paymentStatus: "PAYED",
        message: "پرداخت قبلا تایید شده است",
      };
    }
    if(inquiryResponse.data.status == '200') {
      return {
        paymentStatus: "WAITING",
        message: "به دریافت کننده واریز شد",
      };
    }
    return {
      paymentStatus: "FAILED",
      message: "تراکنش ناموفق بوده است.",
    };
  } catch (error) {
    return new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      cause: "paymentService inquiry problem",
    });
  }
}

