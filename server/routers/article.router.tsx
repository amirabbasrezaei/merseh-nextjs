import {
  createArticleController,
  createArticleInput,
} from "../Controllers/article.controller";
import { adminProtectedProcedure, router } from "../trpc";

export const articleRouter = router({
  createArticle: adminProtectedProcedure
    .input(createArticleInput)
    .mutation(createArticleController),
});
