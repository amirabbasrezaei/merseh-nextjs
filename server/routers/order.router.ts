import {
  createOrderController,
  createOrderInputSchema,
  getActiveOrderController,
} from "../Controllers/order.controller";
import { router, userProtectedProcedure } from "../trpc";

export const orderRouter = router({
  createorder: userProtectedProcedure
    .input(createOrderInputSchema)
    .mutation(createOrderController),
  getActiveOrder: userProtectedProcedure.query(getActiveOrderController),
});
