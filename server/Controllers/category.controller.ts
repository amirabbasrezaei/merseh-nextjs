import { z } from "zod";
import { Context } from "../context";
import { contentType } from "@/Components/Admin/AddProduct/QuillEditor";
import { parentCategories } from "../utils/category";
import { TRPCError } from "@trpc/server";
import { TRPCClientError } from "@trpc/client";
import { CategoryStatus } from "@/generated/prisma/client";
import {
  deleteStoredFile,
  publicUrl,
  uploadFromBase64,
} from "../utils/storage";

const categoryImageInput = z.object({
  base64: z.string().min(1),
  name: z.string().min(1),
});

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

  let categories = await prisma.category.findMany({
    where: { status: "ENABLED" },
    include: { imageFile: true },
    orderBy: { id: "asc" },
  });
  categories = categories.map((e) => ({
    ...e,
    imageUrl: e.imageFile ? publicUrl(e.imageFile.key) : "",
    content: e.content.length ? JSON.parse(e.content) : [],
  }));

  interface categoryRawType {
    id: number;
    title: string;
    parentCategoryId: number | null;
    imageUrl: string;
    englishTitle: string;
    content: contentType[];
    metaDescription: string;
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
  title: z.string().min(1),
  parentId: z.number().optional().nullable(),
  image: categoryImageInput.optional(),
});

type CreateCategoryArgs = z.infer<typeof createCategorySchema>;

export async function createCategory({
  input,
  ctx,
}: ArgsStructure<CreateCategoryArgs>) {
  const { prisma } = ctx;
  let imageFileId: string | undefined;
  if (input.image) {
    const file = await uploadFromBase64(input.image, "category");
    if (!file) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "آپلود تصویر دسته‌بندی ناموفق بود",
      });
    }
    imageFileId = file.id;
  }

  const newCategory = await prisma.category.create({
    data: {
      title: input.title,
      parentCategoryId: input.parentId ?? null,
      imageFileId,
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
  image: categoryImageInput.optional(),
});
type EditCategory = z.infer<typeof EditCategorySchema>;
export async function editCategoryController({
  ctx,
  input,
}: ArgsStructure<EditCategory>) {
  const { prisma } = ctx;
  const existing = await prisma.category.findUnique({
    where: { id: input.categoryId },
  });
  if (!existing) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "دسته‌بندی یافت نشد",
    });
  }

  let imageFileId = existing.imageFileId;
  let replacedFileId: string | null = null;

  if (input.image) {
    const file = await uploadFromBase64(input.image, "category");
    if (!file) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "آپلود تصویر دسته‌بندی ناموفق بود",
      });
    }
    replacedFileId = existing.imageFileId;
    imageFileId = file.id;
  }

  if (!imageFileId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "تصویر دسته‌بندی الزامی است",
    });
  }

  await prisma.category.update({
    where: {
      id: input.categoryId,
    },
    data: {
      content: input.content,
      englishTitle: input.englishName,
      title: input.name,
      updated_at: new Date(),
      metaDescription: input.metaDescription,
      imageFileId,
    },
  });

  if (replacedFileId && replacedFileId !== imageFileId) {
    await deleteStoredFile(replacedFileId);
  }

  return { status: true, error: null, message: "تغییرات با موفقیت انجام شد" };
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
      select: {
        title: true,
        metaDescription: true,
        content: true,
        englishTitle: true,
        imageFile: true,
      },
    });

    return {
      category: {
        title: category?.title,
        imageUrl: category?.imageFile
          ? publicUrl(category.imageFile.key)
          : "",
        metaDescription: category?.metaDescription || "",
        englishTitle: category?.englishTitle,
        content: category?.content,
        parent_categories: await parentCategories({
          categoryId: input.categoryId,
        }),
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
      select: {
        id: true,
        title: true,
        updated_at: true,
        status: true,
        imageFile: { select: { key: true } },
      },
      where: { status: "ENABLED" },
    });
    return {
      categories: categories.map((category) => ({
        id: category.id,
        title: category.title,
        updated_at: category.updated_at,
        status: category.status,
        imageUrl: category.imageFile ? publicUrl(category.imageFile.key) : "",
      })),
      statusOptions: [
        { value: "ENABLED", name: "فعال" },
        { value: "DISABLED", name: "غیرفعال" },
      ],
      error: null,
    };
  } catch (error) {
    console.log(error);
    return { categories: null, statusOptions: null, error };
  }
}

export const ChangeCategoryStatusSchema = z.object({
  categoryId: z.string(),
  status: z.enum(["ENABLED", "DISABLED"]),
});

type ChangeCategoryStatus = z.infer<typeof ChangeCategoryStatusSchema>;

export async function change_category_status({
  ctx: { prisma },
  input,
}: ArgsStructure<ChangeCategoryStatus>) {
  try {
    const category = await prisma.category.update({
      where: { id: Number(input.categoryId) },
      data: { status: input.status },
    });
    return { currentStatus: category.status };
  } catch (error) {
    console.log(error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: JSON.stringify(error || "{}"),
    });
  }
}

