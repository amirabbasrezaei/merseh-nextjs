import {
  activeOrderInputSchema,
  applyCouponController,
  applyCouponInputSchema,
  getActiveOrderController,
  ordersController,
  removeCouponController,
  selectShippingController,
  selectShippingInputSchema,
  updateActiveOrderController,
} from "../Controllers/order.controller";
import { router, userProtectedProcedure } from "../trpc";

export const orderRouter = router({
  updateActiveOrder: userProtectedProcedure
    .input(activeOrderInputSchema)
    .mutation(updateActiveOrderController),
  getActiveOrder: userProtectedProcedure.query(getActiveOrderController),
  selectShipping: userProtectedProcedure
    .input(selectShippingInputSchema)
    .mutation(selectShippingController),
  applyCoupon: userProtectedProcedure
    .input(applyCouponInputSchema)
    .mutation(applyCouponController),
  removeCoupon: userProtectedProcedure.mutation(removeCouponController),
  orders: userProtectedProcedure.query(ordersController),
});
