import { z } from "zod";
import { ArgsStructure } from "./category.controller";

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

  const filterProducts = await prisma.product.findMany({
    where: {
      name: { contains: searchTerm },
      category: categoryId
        ? {
            some: {
              id: categoryId,
            },
          }
        : {},
    },
  });
  return filterProducts;
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
