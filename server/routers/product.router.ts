import {

  categoriesController,
  createCategory,
  createCategorySchema,

} from "../Controllers/category.controller";
import {
  AddProductControllerArgSchema,
  ProductCartInfoInputSchema,
  addProductController,
  getProductController,
  getProductInputSchema,
  productCarouselController,
  productCartInfoController,
} from "../Controllers/product.controller";
import { publicProcedure, router } from "../trpc";

export const productRouter = router({
  getproduct: publicProcedure
    .input(getProductInputSchema)
    .query(getProductController),
  categories: publicProcedure.query(categoriesController),

  addProduct: publicProcedure
    .input(AddProductControllerArgSchema)
    .mutation(addProductController),
  createCategory: publicProcedure
    .input(createCategorySchema)
    .mutation(createCategory),
  // get product image for shopping cart
  productCartInfo: publicProcedure
    .input(ProductCartInfoInputSchema)
    .query(productCartInfoController),
  productCarousel: publicProcedure.query(productCarouselController),
});
