import {
  EditCategorySchema,
  categoriesController,
  createCategory,
  createCategorySchema,
  editCategoryController,
} from "../Controllers/category.controller";
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
} from "../Controllers/product.controller";
import { adminProtectedProcedure, publicProcedure, router } from "../trpc";

export const productRouter = router({
  getproduct: publicProcedure
    .input(getProductInputSchema)
    .query(getProductController),
  categories: publicProcedure.query(categoriesController),

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
});
