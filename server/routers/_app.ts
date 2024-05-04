import { publicProcedure, router } from "../trpc";
import { paymentRouter } from "./payment.router";
import { productRouter } from "./product.router";
import { userRouter } from "./user.router";

export const appRouter = router({
  product: productRouter,
  user: userRouter,
  payment: paymentRouter
});
// export type definition of API
export type AppRouter = typeof appRouter;
