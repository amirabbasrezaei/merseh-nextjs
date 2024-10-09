import {
  article_for_sitemap,
  articlesController,
  createArticleController,
  createArticleInput,
  editArticleController,
  editArticleInput,
  getArticleController,
  getArticleController_admin,
  getArticleInput,
  recentArticlesController,
} from "../Controllers/article.controller";
import {
  add_article_comment_controller,
  add_article_comment_schema,
  article_comments_schema,
  get_article_comments,
} from "../Controllers/comment.controller";
import {
  adminProtectedProcedure,
  publicProcedure,
  router,
  userProtectedProcedure,
} from "../trpc";

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
  recentArticles: publicProcedure.query(recentArticlesController),
  comments: publicProcedure
    .input(article_comments_schema)
    .query(get_article_comments),
  addComment: userProtectedProcedure
    .input(add_article_comment_schema)
    .mutation(add_article_comment_controller),
  sitemapArticle: publicProcedure.query(article_for_sitemap),
  getArticleAdmin: adminProtectedProcedure
    .input(getArticleInput)
    .query(getArticleController_admin),
});
