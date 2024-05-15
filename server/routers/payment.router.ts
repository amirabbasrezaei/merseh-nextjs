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
import { router, userProtectedProcedure } from "../trpc";

export const paymentRouter = router({
  createPayment: userProtectedProcedure
    .input(createPaymentSchemaZibal)
    .mutation(createPaymentControllerZibal),
  inquiryPayment: userProtectedProcedure
    .input(inquiryPaymentSchemaZibal)
    .mutation(inquiryPaymentControllerZibal),
});
