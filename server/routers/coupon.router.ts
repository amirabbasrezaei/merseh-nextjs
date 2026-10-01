import {
  createCouponController,
  createCouponInput,
  listCouponsController,
  setCouponActiveController,
  setCouponActiveInput,
  updateCouponController,
  updateCouponInput,
} from "../Controllers/coupon.controller";
import { adminProtectedProcedure, router } from "../trpc";

export const couponRouter = router({
  list: adminProtectedProcedure.query(listCouponsController),
  create: adminProtectedProcedure
    .input(createCouponInput)
    .mutation(createCouponController),
  update: adminProtectedProcedure
    .input(updateCouponInput)
    .mutation(updateCouponController),
  setActive: adminProtectedProcedure
    .input(setCouponActiveInput)
    .mutation(setCouponActiveController),
});
