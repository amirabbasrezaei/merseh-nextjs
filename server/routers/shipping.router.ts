import { ShippingPricesInputSchema, getShippingPricesController } from "../Controllers/shipping.controller";
import { publicProcedure, router, userProtectedProcedure } from "../trpc";

export const shippingRouter = router({
  getPrices: publicProcedure.input(ShippingPricesInputSchema).mutation(getShippingPricesController),
});
