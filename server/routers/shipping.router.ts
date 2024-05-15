import {
  AddAddressInputSchema,
  GetCitiesInputSchema,
  ShippingPricesInputSchema,
  addAddressController,
  getCitiesController,
  getShippingPricesController,
  // importCities,
  userAddressesController,
} from "../Controllers/shipping.controller";
import { publicProcedure, router, userProtectedProcedure } from "../trpc";

export const shippingRouter = router({
  shippingPrices: userProtectedProcedure
    .input(ShippingPricesInputSchema)
    .mutation(getShippingPricesController),
  userAddress: userProtectedProcedure.query(userAddressesController),
  addAddress: userProtectedProcedure
    .input(AddAddressInputSchema)
    .mutation(addAddressController),
  // importCities: publicProcedure.query(importCities),
  getCities: userProtectedProcedure
    .input(GetCitiesInputSchema)
    .query(getCitiesController),
});
