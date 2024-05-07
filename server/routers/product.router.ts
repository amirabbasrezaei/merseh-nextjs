import {
  FilterProductArgsSchema,
  categoriesController,
  filterProductController,
} from "../Controllers/category.controller";
import {
  AddProductControllerArgSchema,
  addProductController,
  getProductsController,
} from "../Controllers/product.controller";
import { publicProcedure, router } from "../trpc";

export const productRouter = router({
  getproducts: publicProcedure.query(getProductsController),
  categories: publicProcedure.query(categoriesController),
  filterProduct: publicProcedure
    .input(FilterProductArgsSchema)
    .mutation(filterProductController),
  addProduct: publicProcedure
    .input(AddProductControllerArgSchema)
    .mutation(addProductController),
});
