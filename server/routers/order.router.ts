import {
  activeOrderInputSchema,
  getActiveOrderController,
  ordersController,
  updateActiveOrderController,
} from "../Controllers/order.controller";
import { router, userProtectedProcedure } from "../trpc";

export const orderRouter = router({
  updateActiveOrder: userProtectedProcedure
    .input(activeOrderInputSchema)
    .mutation(updateActiveOrderController),
  getActiveOrder: userProtectedProcedure.query(getActiveOrderController),
  orders: userProtectedProcedure.query(ordersController),
});
