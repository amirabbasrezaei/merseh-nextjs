import { z } from "zod";
import { Context } from "../context";
import { contentType } from "@/Components/Admin/AddProduct/QuillEditor";
import { parentCategories } from "../utils/category";
import { TRPCError } from "@trpc/server";

export type ArgsStructure<T = null> = T extends null
  ? {
      ctx: Context;
    }
  : {
      ctx: Context;
      input: T;
    };

export async function categoriesController({ ctx }: ArgsStructure) {
  const { prisma } = ctx;

  let categories = await prisma.category.findMany();
  categories = categories.map((e) => ({
    ...e,
    imageUrl: `${process.env.NEXT_PUBLIC_STATIC_FILES_ENDPOINT}/category/${e.imageName}`,
    content: e.content.length ? JSON.parse(e.content) : [],
  }));

  interface categoryRawType {
    id: number;
    title: string;
    parentCategoryId: number | null;
    imageUrl: string;
    englishTitle: string;
    content: contentType[];
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

export const createCategorySchema = z.object({
  title: z.string(),
  parentId: z.number(),
});

type CreateCategoryArgs = z.infer<typeof createCategorySchema>;

export async function createCategory({
  input,
  ctx,
}: ArgsStructure<CreateCategoryArgs>) {
  const { prisma } = ctx;
  const newCategory = await prisma.category.create({
    data: {
      title: input.title,
      parentCategoryId: input.parentId,
    },
  });

  return newCategory;
}

export const EditCategorySchema = z.object({
  categoryId: z.number(),
  englishName: z.string(),
  name: z.string(),
  content: z.string(),
  metaDescription: z.string(),
});
type EditCategory = z.infer<typeof EditCategorySchema>;
export async function editCategoryController({
  ctx,
  input,
}: ArgsStructure<EditCategory>) {
  const { prisma } = ctx;
  try {
    await prisma.category.update({
      where: {
        id: input.categoryId,
      },
      data: {
        content: input.content,
        englishTitle: input.englishName,
        title: input.name,
        updated_at: new Date(Date.now()),
        metaDescription: input.metaDescription,
      },
    });
    return { status: true, error: null, message: "تغییرات با موفقیت انجام شد" };
  } catch (error) {
    return { status: false, error, message: "خطا در تغییر دسته بندی" };
  }
}

export const categoryInfoSchema = z.object({
  categoryId: z.number(),
});

type CategoryInfo = z.infer<typeof categoryInfoSchema>;
export async function categoryInfoController({
  input,
  ctx: { prisma },
}: ArgsStructure<CategoryInfo>) {
  try {
    const category = await prisma.category.findUnique({
      where: {
        id: input.categoryId,
      },
      select: { title: true, imageName: true, metaDescription: true },
    });

    return {
      category: {
        title: category?.title,
        imageUrl: `${process.env.NEXT_PUBLIC_STATIC_FILES_ENDPOINT}/category/${category?.imageName}`,
        metaDescription: category?.metaDescription || "",
      },
    };
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: JSON.stringify(error || "{}"),
    });
  }
}

export async function flatCategoriesController({
  ctx: { prisma },
}: ArgsStructure) {
  try {
    const categories = await prisma.category.findMany({
      select: { id: true, title: true, updated_at: true },
    });
    return categories;
  } catch (error) {
    console.log(error);
  }
}
