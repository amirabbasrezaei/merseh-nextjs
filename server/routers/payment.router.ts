// import {
//   createPaymentController,
//   createPaymentSchema,
//   inquiryPaymentController,
//   inquiryPaymentSchema,
// } from "../Controllers/payment(v1)/payment.idpay.controller";
import {
  createPaymentControllerZibal,
  createPaymentSchemaZibal,
  inquiryPaymentControllerZibal,
  inquiryPaymentSchemaZibal,
} from "../Controllers/payment(v1)/payment.zibal.controller";
import { publicProcedure, router, userProtectedProcedure } from "../trpc";

export const paymentRouter = router({
  createPayment: userProtectedProcedure
    .input(createPaymentSchemaZibal)
    .mutation(createPaymentControllerZibal),
  inquiryPayment: publicProcedure
    .input(inquiryPaymentSchemaZibal)
    .mutation(inquiryPaymentControllerZibal),
});
