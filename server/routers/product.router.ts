import { categoriesController } from "../Controllers/category.controller";
import { getProductsController } from "../Controllers/product.controller";
import { publicProcedure, router } from "../trpc";

export const productRouter = router({
  getproducts: publicProcedure.query(getProductsController),
  categories: publicProcedure.query(categoriesController)
});
