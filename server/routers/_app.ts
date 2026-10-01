import { publicProcedure, router } from "../trpc";
import { articleRouter } from "./article.router";
import { bannerRouter } from "./banner.router";
import { brandRouter } from "./brand.router";
import { carouselRouter } from "./carousel.router";
import { commentRouter } from "./comment.router";
import { couponRouter } from "./coupon.router";
import { filterRouter } from "./filter.router";
import { mediaRouter } from "./media.router";
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
  article: articleRouter,
  comment: commentRouter,
  media: mediaRouter,
  banner: bannerRouter,
  brand: brandRouter,
  carousel: carouselRouter,
  coupon: couponRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
