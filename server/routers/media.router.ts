import {
  deleteContentImageController,
  deleteContentImageInput,
  uploadContentImageController,
  uploadContentImageInput,
} from "../Controllers/media.controller";
import { adminProtectedProcedure, router } from "../trpc";

export const mediaRouter = router({
  uploadContentImage: adminProtectedProcedure
    .input(uploadContentImageInput)
    .mutation(uploadContentImageController),
  deleteContentImage: adminProtectedProcedure
    .input(deleteContentImageInput)
    .mutation(deleteContentImageController),
});
