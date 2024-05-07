import { z } from "zod";
import { Context } from "../context";

type ArgsStructure<T = null> = T extends null
  ? {
      ctx: Context;
    }
  : {
      ctx: Context;
      input: T;
    };

export async function categoriesController({ ctx }: ArgsStructure) {
  const { prisma } = ctx;
  const categories = await prisma.category.findMany();

  interface categoryRawType {
    id: string;
    title: string;
    parentCategoryId: string | null;
  }

  interface categoryFinalType extends categoryRawType {
    subCategories?: categoryFinalType[];
    insertedIntoParent?: boolean;
  }

  function perpareCategories(data: categoryFinalType[]): categoryFinalType[] {
    let n = 5; // set Number of Category Layers here   ;

    while (n > 0) {
      for (let oIndex = 0; oIndex < data.length; oIndex++) {
        for (let iIndex = 0; iIndex < data.length; iIndex++) {
          if (data[iIndex].parentCategoryId === data[oIndex].id) {
            if (data[oIndex].subCategories?.length) {
              data[oIndex] = {
                ...data[oIndex],
                subCategories: [
                  ...(data[oIndex].subCategories as categoryFinalType[]),
                  data[iIndex],
                ],
              };
            } else {
              data[oIndex] = {
                ...data[oIndex],
                subCategories: [data[iIndex]],
              };
            }
            data[iIndex].insertedIntoParent = true;
          }
        }
      }
      --n;
    }

    data = data.filter((cat) => cat.insertedIntoParent !== true);

    function cleanData(data: categoryFinalType[]) {
      if (data.length == 0) {
        return data;
      }

      const result: categoryFinalType[] = [];

      for (let o = 0; o < data.length; o++) {
        for (let i = o + 1; i < data.length; i++) {
          delete data[o].insertedIntoParent;
          if (data[o].id == data[i].id) {
            delete data[o];
            o++;
          }
        }
      }

      data.map((cat, i) => {
        if (cat !== null) {
          result.push(cat);
        }
      });
      const df: any = result.map((cat) => {
        if (cat.subCategories?.length) {
          return { ...cat, subCategories: cleanData(cat.subCategories) };
        } else {
          return cat;
        }
      });

      return df;
    }

    return cleanData(data);
  }

  return perpareCategories(categories as unknown as categoryFinalType[]);
}

export const FilterProductArgsSchema = z.object({
  categoryId: z.string().optional(),
  searchTerm: z.string().optional(),
});

type FilterProductArgs = z.infer<typeof FilterProductArgsSchema>;

export async function filterProductController({
  ctx,
  input,
}: ArgsStructure<FilterProductArgs>) {
  const { prisma } = ctx;
  const { categoryId, searchTerm } = input;
  console.log(input);
  const filterProducts = await prisma.product.findMany({
    where: {
      name: {
        contains: searchTerm,
      },
      AND: categoryId?.length
        ? [
            {
              category: {
                every: {
                  id: Number(categoryId),
                },
              },
            },
          ]
        : [],
    },
  });

  return filterProducts;
}
