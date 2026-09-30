import {
  createBannerController,
  createBannerInput,
  deleteBannerController,
  deleteBannerInput,
  listActiveBannersController,
  listBannersAdminController,
  reorderBannersController,
  reorderBannersInput,
  setBannerActiveController,
  setBannerActiveInput,
  updateBannerController,
  updateBannerInput,
} from "../Controllers/banner.controller";
import {
  adminProtectedProcedure,
  publicProcedure,
  router,
} from "../trpc";

export const bannerRouter = router({
  listActive: publicProcedure.query(listActiveBannersController),
  list: adminProtectedProcedure.query(listBannersAdminController),
  create: adminProtectedProcedure
    .input(createBannerInput)
    .mutation(createBannerController),
  update: adminProtectedProcedure
    .input(updateBannerInput)
    .mutation(updateBannerController),
  reorder: adminProtectedProcedure
    .input(reorderBannersInput)
    .mutation(reorderBannersController),
  setActive: adminProtectedProcedure
    .input(setBannerActiveInput)
    .mutation(setBannerActiveController),
  delete: adminProtectedProcedure
    .input(deleteBannerInput)
    .mutation(deleteBannerController),
});
