import { publicProcedure, router } from "../trpc";
import { filterRouter } from "./filter.router";
import { orderRouter } from "./order.router";
import { paymentRouter } from "./payment.router";
import { productRouter } from "./product.router";
import { shippingRouter } from "./shipping.router";
import { userRouter } from "./user.router";

export const appRouter = router({
  product: productRouter,
  user: userRouter,
  payment: paymentRouter,
  order: orderRouter,
  shipping: shippingRouter,
  filter: filterRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
