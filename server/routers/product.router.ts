import { getProductsController } from "../Controllers/product.controller";
import { publicProcedure, router } from "../trpc";

export const productRouter = router({
  getproducts: publicProcedure.query(getProductsController),
});
