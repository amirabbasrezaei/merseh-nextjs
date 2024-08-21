import {
  ChangeCategoryStatusSchema,
  EditCategorySchema,
  categoriesController,
  categoryInfoController,
  categoryInfoSchema,
  change_category_status,
  createCategory,
  createCategorySchema,
  editCategoryController,
  flatCategoriesController,
} from "../Controllers/category.controller";
import {
  add_proudct_comment_controller,
  add_product_comment_schema,
  editCommentController,
  editCommentSchema,
  get_product_comments,
  likeCommentController,
  likeCommentSchema,
  product_comments_schema,
} from "../Controllers/comment.controller";
import {
  AddProductControllerArgSchema,
  ProductCartInfoInputSchema,
  addProductController,
  editProductController,
  editProductInputSchema,
  forTorobProductController,
  getProductController,
  getProductInputSchema,
  productCarouselController,
  productCartInfoController,
  productsController,
  short_info_products_controller,
} from "../Controllers/product.controller";
import {
  adminProtectedProcedure,
  publicProcedure,
  router,
  userProtectedProcedure,
} from "../trpc";

export const productRouter = router({
  getproduct: publicProcedure
    .input(getProductInputSchema)
    .query(getProductController),
  categories: publicProcedure.query(categoriesController),
  flatCategories: publicProcedure.query(flatCategoriesController),
  addProduct: adminProtectedProcedure
    .input(AddProductControllerArgSchema)
    .mutation(addProductController),
  createCategory: adminProtectedProcedure
    .input(createCategorySchema)
    .mutation(createCategory),
  // get product image for shopping cart
  productCartInfo: publicProcedure
    .input(ProductCartInfoInputSchema)
    .query(productCartInfoController),
  productCarousel: publicProcedure.query(productCarouselController),
  products: publicProcedure.query(productsController),
  productsForTorob: publicProcedure.query(forTorobProductController),
  editCategory: adminProtectedProcedure
    .input(EditCategorySchema)
    .mutation(editCategoryController),
  editProduct: adminProtectedProcedure
    .input(editProductInputSchema)
    .mutation(editProductController),
  addComment: userProtectedProcedure
    .input(add_product_comment_schema)
    .mutation(add_proudct_comment_controller),
  productComments: publicProcedure
    .input(product_comments_schema)
    .query(get_product_comments),
  editComment: userProtectedProcedure
    .input(editCommentSchema)
    .mutation(editCommentController),
  likeComment: userProtectedProcedure
    .input(likeCommentSchema)
    .mutation(likeCommentController),
  categoryInfo: publicProcedure
    .input(categoryInfoSchema)
    .query(categoryInfoController),
  shortInfoProducts: publicProcedure.query(short_info_products_controller),
  changeCategoryStatus: adminProtectedProcedure
    .input(ChangeCategoryStatusSchema)
    .mutation(change_category_status)
});
