import { z } from "zod";
import { ArgsStructure } from "./category.controller";
import { TRPCClientError } from "@trpc/client";
import { childrenCategories, parentCategories } from "../utils/category";

export const FilterProductArgsSchema = z.object({
  categoryId: z.number().optional(),
  searchTerm: z.string().optional(),
});

type FilterProductArgs = z.infer<typeof FilterProductArgsSchema>;

export async function filterProductController({
  ctx,
  input,
}: ArgsStructure<FilterProductArgs>) {
  const { prisma } = ctx;
  const { categoryId, searchTerm } = input;

  try {
    const categoryChildrens = await childrenCategories({
      categoryId: categoryId || -1,
    });
    const filterProducts = await prisma.product.findMany({
      where: {
        name: { contains: searchTerm },
        category: categoryId
          ? { some: { id: { in: [categoryId, ...categoryChildrens] } } }
          : {},
      },
      select: {
        id: true,
        price: true,
        imageNames: true,
        ProductVariation: {
          include: {
            values: true,
          },
        },
        name: true,
      },
    });
    
    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
      select: {
        content: true,
        title: true,
      },
    });

    return {
      products: filterProducts,
      categoryInfo: {
        title: category?.title,
        content: category?.content?.length ? JSON.parse(category.content) : [],
      },
    };
  } catch (error) {
    throw new TRPCClientError("خطا در دریافت محصولات");
  }
}

export const SearchControllerInputSchema = z.object({
  text: z.string(),
});

export async function searchController({
  ctx: { prisma },
  input,
}: ArgsStructure<z.infer<typeof SearchControllerInputSchema>>) {
  try {
    const searchResults = await prisma.category.findMany({
      where: {
        title: {
          contains: input.text,
        },
      },
    });

    return { result: searchResults, status: "ok", error: null };
  } catch (error) {
    return { result: [], status: "failed", error };
  }
}
