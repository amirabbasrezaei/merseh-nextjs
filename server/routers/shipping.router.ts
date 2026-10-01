import {
  AddAddressInputSchema,
  GetCitiesInputSchema,
  addAddressController,
  getCitiesController,
  importCities,
  listCarriersAdminController,
  shippingMethodsController,
  updateCarrierController,
  updateCarrierInput,
  userAddressesController,
} from "../Controllers/shipping.controller";
import {
  adminProtectedProcedure,
  publicProcedure,
  router,
  userProtectedProcedure,
} from "../trpc";

export const shippingRouter = router({
  methods: userProtectedProcedure.query(shippingMethodsController),
  userAddress: userProtectedProcedure.query(userAddressesController),
  addAddress: userProtectedProcedure
    .input(AddAddressInputSchema)
    .mutation(addAddressController),
  importCities: publicProcedure.query(importCities),
  getCities: userProtectedProcedure
    .input(GetCitiesInputSchema)
    .query(getCitiesController),
  adminCarriers: adminProtectedProcedure.query(listCarriersAdminController),
  updateCarrier: adminProtectedProcedure
    .input(updateCarrierInput)
    .mutation(updateCarrierController),
});
