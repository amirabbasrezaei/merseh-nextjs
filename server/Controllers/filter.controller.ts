import { z } from "zod";
import { ArgsStructure } from "./category.controller";
import { TRPCClientError } from "@trpc/client";
import { childrenCategories, parentCategories } from "../utils/category";
import { galleryImageUrls, galleryInclude } from "../utils/storage";
import { mapStoreBrand } from "../utils/productCard";

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
        status: "PUBLISHED",
        name: { contains: searchTerm },
        category: categoryId
          ? { some: { id: { in: [categoryId, ...categoryChildrens] } } }
          : {},
      },
      select: {
        id: true,
        price: true,
        ProductVariation: {
          include: {
            values: true,
          },
        },
        name: true,
        brand: {
          select: { id: true, name: true, isActive: true },
        },
        ...galleryInclude(),
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

    console.log(categoryId);

    return {
      products: filterProducts.map((product) => {
        const urls = galleryImageUrls(product.galleryFiles);
        return {
          ...product,
          imageNames: urls,
          imageUrls: urls,
          brand: mapStoreBrand(product.brand),
        };
      }),
      categoryInfo: {
        title: category?.title,
        content: category?.content?.length ? JSON.parse(category.content) : [],
        categoryParents: await parentCategories({
          categoryId: categoryId || -1,
        }),
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
