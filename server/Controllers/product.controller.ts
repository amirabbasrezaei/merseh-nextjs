import { Context } from "../context";


type ProductRouterArgsController<T = null> = T extends null
    ? {
        ctx: Context;
    }
    : {
        ctx: Context;
        input: T;
    };


export async function getProductsController({ ctx }:ProductRouterArgsController ) {
  const products = await ctx.prisma.product.findMany();
  return products;
}
