import { z } from "zod";
import { ArgsStructure } from "./category.controller";
import { TRPCClientError } from "@trpc/client";
import { childrenCategories, parentCategories } from "../utils/category";
import {
  firstGalleryImageUrl,
  galleryImageUrls,
  galleryInclude,
  publicUrl,
} from "../utils/storage";
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
        discount: true,
        freeShipping: true,
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

const SEARCH_PRODUCT_LIMIT = 5;
const SEARCH_CATEGORY_LIMIT = 5;

export const SearchControllerInputSchema = z.object({
  text: z.string(),
});

export async function searchController({
  ctx: { prisma },
  input,
}: ArgsStructure<z.infer<typeof SearchControllerInputSchema>>) {
  try {
    const [categories, products] = await Promise.all([
      prisma.category.findMany({
        where: { status: "ENABLED", title: { contains: input.text } },
        take: SEARCH_CATEGORY_LIMIT,
        select: {
          id: true,
          title: true,
          imageFile: { select: { key: true } },
        },
      }),
      prisma.product.findMany({
        where: { status: "PUBLISHED", name: { contains: input.text } },
        take: SEARCH_PRODUCT_LIMIT,
        select: {
          id: true,
          name: true,
          price: true,
          discount: true,
          ...galleryInclude(),
        },
      }),
    ]);

    return {
      result: categories.map(({ imageFile, ...category }) => ({
        ...category,
        imageUrl: imageFile ? publicUrl(imageFile.key) : "",
      })),
      products: products.map(({ galleryFiles, ...product }) => ({
        ...product,
        imageUrl: firstGalleryImageUrl(galleryFiles),
      })),
      status: "ok",
      error: null,
    };
  } catch (error) {
    return { result: [], products: [], status: "failed", error };
  }
}
