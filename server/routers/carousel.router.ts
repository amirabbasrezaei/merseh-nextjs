import {
  carouselIdInput,
  createCarouselController,
  createCarouselInput,
  deleteCarouselController,
  getCarouselAdminController,
  listActiveCarouselsController,
  listCarouselsAdminController,
  searchCarouselProductsController,
  searchCarouselProductsInput,
  setCarouselActiveController,
  setCarouselActiveInput,
  updateCarouselController,
  updateCarouselInput,
} from "../Controllers/carousel.controller";
import { adminProtectedProcedure, publicProcedure, router } from "../trpc";

export const carouselRouter = router({
  listActive: publicProcedure.query(listActiveCarouselsController),
  list: adminProtectedProcedure.query(listCarouselsAdminController),
  get: adminProtectedProcedure
    .input(carouselIdInput)
    .query(getCarouselAdminController),
  create: adminProtectedProcedure
    .input(createCarouselInput)
    .mutation(createCarouselController),
  update: adminProtectedProcedure
    .input(updateCarouselInput)
    .mutation(updateCarouselController),
  setActive: adminProtectedProcedure
    .input(setCarouselActiveInput)
    .mutation(setCarouselActiveController),
  delete: adminProtectedProcedure
    .input(carouselIdInput)
    .mutation(deleteCarouselController),
  searchProducts: adminProtectedProcedure
    .input(searchCarouselProductsInput)
    .query(searchCarouselProductsController),
});
