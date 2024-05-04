import { z } from "zod";
import { Context } from "../../context";
import axios from "axios";
import { TRPCError } from "@trpc/server";

const BASE_URL = 'https://gateway.zibal.ir'

type PaymentRouterArgsController<T = null> = T extends null
    ? {
        ctx: Context;
    }
    : {
        ctx: Context;
        input: T;
    };

export const createPaymentSchemaZibal = z.object({
    amount: z.number(),
});
type CreatePaymentPayloadZibal =
    {
        pay_link?: string;
        message?: string;
    }
    | any;

export type CreatePaymentZibal = z.infer<typeof createPaymentSchemaZibal>;

export async function createPaymentControllerZibal({ ctx, input }: PaymentRouterArgsController<CreatePaymentZibal>): Promise<CreatePaymentPayloadZibal> {
    const { user, prisma } = ctx;

    const findUser = await prisma.user.findUnique({
        where: {
            id: user.userId
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
            "merchant": process.env.ZIBAL_MERCHANT_CODE as string,
            "amount": input.amount * 10,
            "callbackUrl": "https://zipway.ir/payment",
            "mobile": findUser.phoneNumber,
            "description": "",
            "orderId": String(payment.id),
            "feeMode": 2,
            "linkToPay": true
        };

        const { data } = await axios.post(`${BASE_URL}/v1/request`, body);
        if (data) {
            const updatedPayment = await ctx.prisma.payment.update({
                data: {
                    trackId: String(data.trackId),

                },
                where: {
                    id: payment.id
                },
            });
            console.log(updatedPayment);
        }

        return { pay_link: `${BASE_URL}/start/${data.trackId}` };
    } catch (error) {
        console.log(error);
        return new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "مشکل ارتباط با سرویس پرداخت",
        });
    }
}

export const inquiryPaymentSchemaZibal = z.object({
    order_id: z.string().optional(),
    track_id: z.string(),
    servicePaymentId: z.string().optional()
});

type InquiryPaymentPayloadZibal =
    | { paymentStatus: "PAYED" | "FAILED" | "WAITING"; message: string | null }
    | TRPCError;

export type InquiryPayment = z.infer<typeof inquiryPaymentSchemaZibal>;
export async function inquiryPaymentControllerZibal({
    input,
    ctx,
}: PaymentRouterArgsController<InquiryPayment>): Promise<InquiryPaymentPayloadZibal> {
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

    const verifyBody = {
        "merchant": process.env.ZIBAL_MERCHANT_CODE as string,
        "trackId": Number(input.track_id)
    };
    console.log(0)
    try {
        const verifyTransaction = await axios.post(`${BASE_URL}/v1/verify`, verifyBody)
        console.log(verifyTransaction.data)
        if (verifyTransaction.data.result == 100) {
            
            await prisma.$transaction([prisma.payment.update({
                where: {
                    trackId: input.track_id,

                }, data: {
                    cardNumber: verifyTransaction.data.cardNumber,
                    isPayed: true,
                    payment_success_date: new Date(verifyTransaction.data.paidAt),
                    paymentDescription: "با موفقیت تایید شد.",
                    status: verifyTransaction.data.status
                }
            }), prisma.user.update({
                where: {
                    id: findUser.id
                }, data: {
                    credit: { increment: verifyTransaction.data.amount }
                }
            })])

            return { paymentStatus: "PAYED", message: "پرداخت موفقیت آمیز بود." }

        }

        if (verifyTransaction.data.result == 102) {
            await prisma.payment.update({
                where: {
                    trackId: input.track_id
                }, data: {
                    cardNumber: verifyTransaction.data.cardNumber,
                    isPayed: false,
                    paymentDescription: "merchantیافت نشد.",
                    status: verifyTransaction.data.status
                }
            })
            return { paymentStatus: "FAILED", message: "پرداخت موفقیت آمیز نبود" }
        }

        if (verifyTransaction.data.result == 103) {
            await prisma.payment.update({
                where: {
                    trackId: input.track_id
                }, data: {
                    cardNumber: verifyTransaction.data.cardNumber,
                    isPayed: false,
                    paymentDescription: "merchantغیرفعال",
                    status: verifyTransaction.data.status
                }
            })
            return { paymentStatus: "FAILED", message: "پرداخت موفقیت آمیز نبود" }
        }

        if (verifyTransaction.data.result == 104) {
            await prisma.payment.update({
                where: {
                    trackId: input.track_id
                }, data: {
                    cardNumber: verifyTransaction.data.cardNumber,
                    isPayed: false,
                    paymentDescription: "merchantنامعتبر",
                    status: verifyTransaction.data.status
                }
            })
            return { paymentStatus: "FAILED", message: "پرداخت موفقیت آمیز نبود" }
        }
        if (verifyTransaction.data.result == 201) {
            await prisma.payment.update({
                where: {
                    trackId: input.track_id
                }, data: {
                    cardNumber: verifyTransaction.data.cardNumber,
                    isPayed: false,
                    paymentDescription: "قبلا تایید شده",
                    status: verifyTransaction.data.status
                }
            })
            return { paymentStatus: "PAYED", message: "قبلا پرداخت انجام شده است." }
        }
        if (verifyTransaction.data.result == 202) {
            await prisma.payment.update({
                where: {
                    trackId: input.track_id
                }, data: {
                    cardNumber: verifyTransaction.data.cardNumber,
                    isPayed: false,
                    paymentDescription: "سفارش پرداخت نشده یا ناموفق بوده است.",
                    status: verifyTransaction.data.status
                }
            })
            return { paymentStatus: "FAILED", message: "پرداخت موفقیت آمیز نبود" }
        }
        if (verifyTransaction.data.result == 203) {

            await prisma.payment.update({
                where: {
                    trackId: input.track_id
                }, data: {
                    cardNumber: verifyTransaction.data.cardNumber,
                    isPayed: false,
                    paymentDescription: "trackIdنامعتبر می‌باشد.",
                    status: verifyTransaction.data.status
                }
            })
            return { paymentStatus: "FAILED", message: "پرداخت موفقیت آمیز نبود" }

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
