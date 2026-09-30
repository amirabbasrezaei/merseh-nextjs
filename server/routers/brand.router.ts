import {
  brandIdInput,
  brandInfoController,
  brandProductsController,
  brandProductsInput,
  createBrandController,
  createBrandInput,
  deleteBrandController,
  getBrandAdminController,
  listActiveBrandsController,
  listBrandsAdminController,
  setBrandActiveController,
  setBrandActiveInput,
  updateBrandController,
  updateBrandInput,
} from "../Controllers/brand.controller";
import { adminProtectedProcedure, publicProcedure, router } from "../trpc";

export const brandRouter = router({
  listActive: publicProcedure.query(listActiveBrandsController),
  info: publicProcedure.input(brandIdInput).query(brandInfoController),
  products: publicProcedure
    .input(brandProductsInput)
    .query(brandProductsController),
  list: adminProtectedProcedure.query(listBrandsAdminController),
  get: adminProtectedProcedure.input(brandIdInput).query(getBrandAdminController),
  create: adminProtectedProcedure
    .input(createBrandInput)
    .mutation(createBrandController),
  update: adminProtectedProcedure
    .input(updateBrandInput)
    .mutation(updateBrandController),
  setActive: adminProtectedProcedure
    .input(setBrandActiveInput)
    .mutation(setBrandActiveController),
  delete: adminProtectedProcedure
    .input(brandIdInput)
    .mutation(deleteBrandController),
});
