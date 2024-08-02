import {
  articlesController,
  createArticleController,
  createArticleInput,
  editArticleController,
  editArticleInput,
  getArticleController,
  getArticleInput,
} from "../Controllers/article.controller";
import { adminProtectedProcedure, publicProcedure, router } from "../trpc";

export const articleRouter = router({
  createArticle: adminProtectedProcedure
    .input(createArticleInput)
    .mutation(createArticleController),
  editArticle: adminProtectedProcedure
    .input(editArticleInput)
    .mutation(editArticleController),
  getArticle: publicProcedure
    .input(getArticleInput)
    .query(getArticleController),
  articles: publicProcedure.query(articlesController),
});
