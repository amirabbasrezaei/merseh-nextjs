import { Context } from "../context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ArgsStructure } from "./category.controller";
import { parentCategories } from "../utils/category";
import {
  deleteStoredFile,
  firstGalleryImageUrl,
  galleryImageUrls,
  galleryInclude,
  publicUrl,
  uploadFromBase64,
  uploadManyFromBase64,
} from "../utils/storage";
import {
  mapProductCard,
  PRODUCT_SECTION_LIMIT,
  productCardInclude,
} from "../utils/productCard";

const PUBLISHED = "PUBLISHED" as const;

export const ContentStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

function isAdminUser(user: unknown) {
  return !!(user && typeof user === "object" && (user as any).role === "ADMIN");
}

function collectContentFileIds(nodes: any[]): string[] {
  const ids: string[] = [];
  const walk = (list: any[]) => {
    for (const node of list || []) {
      if (isImageContent(node?.content) && node.content.fileId) {
        ids.push(node.content.fileId);
      }
      if (Array.isArray(node?.childs)) walk(node.childs);
    }
  };
  walk(nodes);
  return [...new Set(ids)];
}

type ProductRouterArgsController<T = null> = T extends null
  ? {
      ctx: Context;
    }
  : {
      ctx: Context;
      input: T;
    };

export const getProductInputSchema = z.object({
  productId: z.number(),
});

const productVariation = z.object({
  variationName: z.string(),
  variations: z.array(
    z.object({
      name: z.string(),
      price: z.number(),
    })
  ),
});

export const imageContentType = z.object({
  src: z.string().optional(),
  name: z.string().optional(),
  fileId: z.string().optional(),
  format: z.string().optional(),
});

export const isImageContent = (
  content: any
): content is z.infer<typeof imageContentType> => {
  return (
    !!content &&
    typeof content === "object" &&
    !Array.isArray(content) &&
    !!(content.src || content.fileId)
  );
};

export const CallToActionProductType = z.object({
  product_name: z.string(),
  product_id: z.number(),
  variationId: z.number().optional(),
  variation_value_id: z.number().optional(),
  variation_value_name: z.string().optional(),
  price: z.number(),
  imageurl: z.string(),
});

export const ContentType = z.object({
  content: z
    .string()
    .or(imageContentType)
    .or(z.array(CallToActionProductType)),
  type: z.string(),
  childs: z.any(),
});

const productVariationForPayload = z.object({
  id: z.number(),
  variationName: z.string(),
  variations: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      price: z.number(),
    })
  ),
});

export const getProductPayloadSchema = z.object({
  product: z
    .object({
      id: z.number(),
      name: z.string(),
      imageUrls: z.array(z.string()),
      price: z.number(),
      variations: z.array(productVariationForPayload),
      content: z.array(ContentType),
    })
    .optional(),
  message: z.string(),
  error: z.string().optional(),
});

type GetProductInputArgs = z.infer<typeof getProductInputSchema>;

async function resolveContentImagesForRead(
  prisma: Context["prisma"],
  nodes: any[]
) {
  return Promise.all(
    nodes.map(async (e: any) => {
      if (e.type === "img" || e.type === "image" || isImageContent(e.content)) {
        const fileId = e.content?.fileId as string | undefined;
        let src = e.content?.src || "";
        if (fileId) {
          const file = await prisma.file.findUnique({ where: { id: fileId } });
          if (file) src = publicUrl(file.key);
        }
        return {
          ...e,
          type: e.type === "image" ? "img" : e.type,
          content: {
            src,
            name: e.content?.name,
            fileId,
            format: e.content?.format,
          },
        };
      }
      return e;
    })
  );
}

async function persistContentImages(nodes: any[], folder: string) {
  const result = [];
  for (const e of nodes) {
    if (isImageContent(e.content)) {
      const existingFileId = e.content.fileId;
      const src = e.content.src || "";
      const isRemote = src.startsWith("http://") || src.startsWith("https://");

      if (existingFileId && (isRemote || !src)) {
        result.push({
          type: e.type,
          childs: e.childs,
          content: {
            fileId: existingFileId,
            format: e.content.format,
            name: e.content.name,
          },
        });
        continue;
      }

      if (src && !isRemote) {
        const file = await uploadFromBase64(
          {
            base64: src,
            name: e.content.name || "content-image",
          },
          folder
        );
        if (file) {
          result.push({
            type: e.type,
            childs: e.childs,
            content: {
              fileId: file.id,
              format: e.content.format,
              name: e.content.name || file.originalName,
            },
          });
          continue;
        }
      }

      result.push({
        type: e.type,
        childs: e.childs,
        content: {
          fileId: existingFileId,
          format: e.content.format,
          name: e.content.name,
        },
      });
      continue;
    }
    result.push(e);
  }
  return result;
}

function mapProductWithGalleryUrls<T extends { galleryFiles?: any[] }>(
  product: T
) {
  const urls = galleryImageUrls(product.galleryFiles);
  const { galleryFiles, ...rest } = product as T & { galleryFiles?: any[] };
  return {
    ...rest,
    imageNames: urls,
    imageUrls: urls,
    imageFileIds: (galleryFiles || []).map((gf: any) => gf.fileId),
  };
}

export async function getProductController({
  ctx,
  input,
}: ProductRouterArgsController<GetProductInputArgs>) {
  try {
    const product = await ctx.prisma.product.findUnique({
      where: {
        id: Number(input.productId),
      },
      select: {
        id: true,
        name: true,
        price: true,
        content: true,
        quantity: true,
        discount: true,
        engName: true,
        category: true,
        mainCategoryId: true,
        metaDescription: true,
        details: true,
        status: true,
        brandId: true,
        brand: {
          select: {
            id: true,
            name: true,
            isActive: true,
            logoFile: { select: { key: true } },
          },
        },
        ...galleryInclude(),
        ProductVariation: {
          select: {
            values: true,
            id: true,
            variateName: true,
          },
        },
      },
    });

    if (!product) {
      throw new TRPCError({ code: "NOT_FOUND", message: "محصول یافت نشد" });
    }

    const admin = isAdminUser(ctx.user);
    if (product.status !== PUBLISHED && !admin) {
      throw new TRPCError({ code: "NOT_FOUND", message: "محصول یافت نشد" });
    }

    const imageUrls = galleryImageUrls(product.galleryFiles);
    const imageFileIds = product.galleryFiles.map((gf) => gf.fileId);

    const result = {
      id: product.id,
      imageUrls,
      imageFileIds,
      imageNames: imageUrls,
      name: product.name,
      englishName: product.engName,
      price: product.price || 0,
      details: product.details,
      metaDescription: product.metaDescription,
      status: product.status,
      isPreview: product.status !== PUBLISHED,
      variations: product.ProductVariation.map((variation) => ({
        id: variation.id,
        variationName: variation.variateName,
        variations: variation.values.map((variationValue) => ({
          name: variationValue.name,
          price: variationValue.price,
          id: variationValue.id,
          discount: variationValue.discount,
          instock: variationValue.quantity ? true : false,
        })),
      })),
      content: await resolveContentImagesForRead(
        ctx.prisma,
        JSON.parse(product.content)
      ),
      instock: product.quantity ? true : false,
      discount: product.discount,
      category: product.category,
      mainCategoryId: product.mainCategoryId,
      brandId: product.brandId,
      brand:
        product.brand && (product.brand.isActive || admin)
          ? {
              id: product.brand.id,
              name: product.brand.name,
              isActive: product.brand.isActive,
              logoUrl: product.brand.logoFile
                ? publicUrl(product.brand.logoFile.key)
                : null,
            }
          : null,
    };
    return { product: result, message: "ok" };
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    return {
      product: null,
      message: "error while finding product",
      error: String(error),
    };
  }
}

const imageType = z.object({
  base64: z.string(),
  name: z.string(),
});

export const AddProductControllerArgSchema = z.object({
  name: z.string(),
  englishName: z.string(),
  price: z.string(),
  images: z.array(imageType),
  categoryId: z.string(),
  parentCategories: z.array(z.number()).optional(),
  productVariations: z.array(productVariation).optional(),
  productContent: z.array(ContentType),
  details: z.array(z.string()),
  metaDescription: z.string(),
  brandId: z.number().int().nullable().optional(),
});

type AddProductControllerArg = z.infer<typeof AddProductControllerArgSchema>;

export async function addProductController({
  input,
  ctx,
}: ProductRouterArgsController<AddProductControllerArg>) {
  const { prisma } = ctx;

  try {
    const galleryFiles = await uploadManyFromBase64(
      input.images,
      "product/gallery"
    );
    const persistedContent = await persistContentImages(
      input.productContent,
      "product/content"
    );
    const parent_categories = await parentCategories({
      categoryId: Number(input.categoryId),
    });

    const newproduct = await prisma.product.create({
      data: {
        metaDescription: input.metaDescription,
        name: input.name,
        price: Number(input.price),
        engName: input.englishName,
        mainCategoryId: Number(input.categoryId),
        details: input.details,
        brandId: input.brandId ?? null,
        category: {
          connect: parent_categories.length
            ? [
                ...parent_categories.map((catId) => ({
                  id: catId,
                })),
                { id: Number(input.categoryId) },
              ]
            : { id: Number(input.categoryId) },
        },
        ProductVariation: input.productVariations?.length
          ? {
              create: input.productVariations.map((variation) => ({
                variateName: variation.variationName,
                values: {
                  createMany: {
                    data: variation.variations.map((variationValue) => ({
                      name: variationValue.name,
                      price: variationValue.price,
                    })),
                  },
                },
              })),
            }
          : {},
        content: JSON.stringify(persistedContent),
        status: "DRAFT",
        galleryFiles: {
          create: galleryFiles.map((file, index) => ({
            fileId: file.id,
            sortOrder: index,
          })),
        },
      },
      include: {
        category: true,
        ...galleryInclude(),
      },
    });

    return {
      status: "ok",
      result: mapProductWithGalleryUrls(newproduct),
    };
  } catch (error) {
    console.log(error);
    return { status: "failed", result: null, error: String(error) };
  }
}

export const ProductCartInfoInputSchema = z.object({
  productId: z.number(),
});

export async function productCartInfoController({
  ctx: { prisma },
  input,
}: ArgsStructure<z.infer<typeof ProductCartInfoInputSchema>>) {
  try {
    const findProduct = await prisma.product.findUnique({
      where: { id: input.productId },
      select: {
        ...galleryInclude(),
      },
    });
    if (findProduct) {
      const result = {
        imageUrls: galleryImageUrls(findProduct.galleryFiles),
      };
      return { result, error: null };
    }
    return { result: null, error: "no product with this id" };
  } catch (error) {
    return { result: null, error };
  }
}

export const relatedProductsInput = z.object({
  productId: z.number().int(),
  categoryId: z.number().int(),
});

export async function relatedProductsController({
  ctx: { prisma },
  input,
}: ArgsStructure<z.infer<typeof relatedProductsInput>>) {
  const products = await prisma.product.findMany({
    where: {
      status: PUBLISHED,
      mainCategoryId: input.categoryId,
      id: { not: input.productId },
    },
    orderBy: { createdAt: "desc" },
    take: PRODUCT_SECTION_LIMIT,
    include: productCardInclude(),
  });
  return { products: products.map(mapProductCard) };
}

export async function productsController({ ctx }: ArgsStructure) {
  const { prisma } = ctx;
  try {
    const products = await prisma.product.findMany({
      where: { status: PUBLISHED },
      orderBy: {
        createdAt: "desc",
      },
      include: galleryInclude(),
    });
    return {
      products: products.map(mapProductWithGalleryUrls),
      error: null,
    };
  } catch (error) {
    return { products: [], error };
  }
}

type DetailedProductScema = {
  product_id: string;
  product_name: string;
  page_url: string;
  variationId?: number;
  variationValueId?: number;
  variationValueName?: string;
  price: number;
};

export async function detailedProductList({ ctx }: ArgsStructure) {
  const { prisma } = ctx;
  try {
    const products = await prisma.product.findMany({
      where: { status: PUBLISHED },
      select: {
        id: true,
        name: true,
        price: true,
        quantity: true,
        discount: true,
        ProductVariation: {
          select: {
            values: {
              select: {
                name: true,
                discount: true,
                price: true,
                id: true,
                quantity: true,
              },
            },
            id: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    const productSchema: DetailedProductScema[] = [];

    products.map((pr) => {
      if (pr.ProductVariation.length) {
        pr.ProductVariation.map((prValues) => {
          prValues.values.map((variationValue) => {
            productSchema.push({
              price: variationValue.price - variationValue.discount,
              page_url: `${process.env.BASE_URL}/product/${
                pr.id
              }/${pr.name.replaceAll(" ", "-")}?variation=${
                prValues.id
              }&variationValue=${variationValue.id}`,
              product_id: `${pr.id}_${prValues.id}_${variationValue.id}`,
              variationId: prValues.id,
              variationValueId: variationValue.id,
              variationValueName: variationValue.name,
              product_name: pr.name,
            });
          });
        });
        return;
      }

      productSchema.push({
        price: pr.price - pr.discount,
        page_url: `${process.env.BASE_URL}/product/${
          pr.id
        }/${pr.name.replaceAll(" ", "-")}`,
        product_id: String(pr.id),
        product_name: pr.name,
      });
    });

    return { productSchema, error: null };
  } catch (error) {
    console.log(error);
    return { productSchema: null, error };
  }
}

type TorobScema = {
  product_id: string;
  page_url: string;
  price: string;
  availability: string;
  old_price: string;
};

export async function forTorobProductController({ ctx }: ArgsStructure) {
  const { prisma } = ctx;
  try {
    const products = await prisma.product.findMany({
      where: { status: PUBLISHED },
      select: {
        id: true,
        name: true,
        price: true,
        quantity: true,
        discount: true,
        ProductVariation: {
          select: {
            values: {
              select: {
                name: true,
                discount: true,
                price: true,
                id: true,
                quantity: true,
              },
            },
            id: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    const torobSchema: TorobScema[] = [];

    products.map((pr) => {
      if (pr.ProductVariation.length) {
        pr.ProductVariation.map((prValues) => {
          prValues.values.map((variationValue) => {
            torobSchema.push({
              availability:
                variationValue.quantity > 0 ? "instock" : "outofstock",
              old_price: String(variationValue.price),
              price: String(variationValue.price - variationValue.discount),
              page_url: `${process.env.BASE_URL}/product/${
                pr.id
              }/${pr.name.replaceAll(" ", "-")}?variation=${
                prValues.id
              }&variationValue=${variationValue.id}`,
              product_id: `${pr.id}_${prValues.id}_${variationValue.id}`,
            });
          });
        });
        return;
      }

      torobSchema.push({
        availability: pr.quantity > 0 ? "instock" : "outofstock",
        old_price: String(pr.price),
        price: String(pr.price - pr.discount),
        page_url: `${process.env.BASE_URL}/product/${
          pr.id
        }/${pr.name.replaceAll(" ", "-")}`,
        product_id: String(pr.id),
      });
    });

    return torobSchema;
  } catch (error) {
    console.log(error);
    return error;
  }
}

export const editProductInputSchema = z.object({
  images: z.object({
    existingImages: z.array(z.string()),
    newImages: z.array(imageType),
  }),
  name: z.string(),
  englishName: z.string(),
  price: z.string(),
  categoryId: z.string(),
  productVariations: z.array(productVariation).optional(),
  productContent: z.array(ContentType),
  productId: z.string(),
  metaDescription: z.string(),
  details: z.array(z.string()),
  brandId: z.number().int().nullable().optional(),
});

export type EditProductInput = z.infer<typeof editProductInputSchema>;

export async function editProductController({
  ctx,
  input,
}: ArgsStructure<EditProductInput>) {
  const { prisma } = ctx;
  const productId = Number(input.productId);

  try {
    const existingFileIds = input.images.existingImages;
    const currentGallery = await prisma.productGalleryFile.findMany({
      where: { productId },
    });

    const removed = currentGallery.filter(
      (gf) => !existingFileIds.includes(gf.fileId)
    );
    for (const gf of removed) {
      await prisma.productGalleryFile.delete({
        where: {
          productId_fileId: { productId, fileId: gf.fileId },
        },
      });
      await deleteStoredFile(gf.fileId);
    }

    const newFiles = await uploadManyFromBase64(
      input.images.newImages,
      "product/gallery"
    );

    for (let i = 0; i < existingFileIds.length; i++) {
      await prisma.productGalleryFile.updateMany({
        where: { productId, fileId: existingFileIds[i] },
        data: { sortOrder: i },
      });
    }

    if (newFiles.length) {
      await prisma.productGalleryFile.createMany({
        data: newFiles.map((file, index) => ({
          productId,
          fileId: file.id,
          sortOrder: existingFileIds.length + index,
        })),
      });
    }

    const persistedContent = await persistContentImages(
      input.productContent,
      "product/content"
    );

    const parent_categories = await parentCategories({
      categoryId: Number(input.categoryId),
    });

    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        metaDescription: input.metaDescription,
        name: input.name,
        price: Number(input.price),
        content: JSON.stringify(persistedContent),
        engName: input.englishName,
        mainCategoryId: Number(input.categoryId),
        details: input.details,
        brandId: input.brandId ?? null,
        category: {
          connect: parent_categories.length
            ? [
                ...parent_categories.map((catId) => ({
                  id: catId,
                })),
                { id: Number(input.categoryId) },
              ]
            : { id: Number(input.categoryId) },
        },
        ProductVariation: input.productVariations?.length
          ? {
              create: input.productVariations.map((variation) => ({
                variateName: variation.variationName,
                values: {
                  createMany: {
                    data: variation.variations.map((variationValue) => ({
                      name: variationValue.name,
                      price: variationValue.price,
                    })),
                  },
                },
              })),
            }
          : {},
      },
    });

    return { status: "ok" };
  } catch (error) {
    console.log(error);
    return { status: "failed", error: String(error) };
  }
}

export async function products_for_sitemap({ ctx: { prisma } }: ArgsStructure) {
  try {
    const products = await prisma.product.findMany({
      where: { status: PUBLISHED },
      select: { id: true, name: true, updatedAt: true },
    });
    return products;
  } catch (error) {
    console.log(error);
  }
}

export const adminProductsListInput = z
  .object({
    status: ContentStatusSchema.optional(),
  })
  .optional();

export async function short_info_products_controller({
  ctx: { prisma },
  input,
}: ArgsStructure<z.infer<typeof adminProductsListInput>>) {
  try {
    const products = await prisma.product.findMany({
      where: input?.status ? { status: input.status } : undefined,
      select: {
        updatedAt: true,
        name: true,
        id: true,
        status: true,
        Comments: {
          select: { User: { select: { name: true, familyName: true } } },
        },
        category: { select: { id: true, title: true } },
        price: true,
        ProductVariation: { include: { values: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return {
      products,
      statusOptions: [
        { value: "DRAFT", title: "پیش‌نویس" },
        { value: "PUBLISHED", title: "منتشر شده" },
        { value: "ARCHIVED", title: "آرشیو" },
      ],
      error: null,
    };
  } catch (error) {
    console.log(error);
    return { products: null, statusOptions: null, error };
  }
}

export const setProductStatusInput = z.object({
  productId: z.number(),
  status: ContentStatusSchema,
});

export async function setProductStatusController({
  ctx: { prisma },
  input,
}: ArgsStructure<z.infer<typeof setProductStatusInput>>) {
  const product = await prisma.product.update({
    where: { id: input.productId },
    data: { status: input.status, updatedAt: new Date() },
    select: { id: true, status: true },
  });
  return { product };
}

export const deleteProductInput = z.object({
  productId: z.number(),
});

export async function deleteProductController({
  ctx: { prisma },
  input,
}: ArgsStructure<z.infer<typeof deleteProductInput>>) {
  const product = await prisma.product.findUnique({
    where: { id: input.productId },
    include: {
      ...galleryInclude(),
      ProductForOrder: { select: { id: true }, take: 1 },
      ProductVariation: { select: { id: true } },
    },
  });
  if (!product) {
    throw new TRPCError({ code: "NOT_FOUND", message: "محصول یافت نشد" });
  }

  if (product.ProductForOrder.length) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        "این محصول در سفارش‌ها استفاده شده و قابل حذف نیست. آن را آرشیو کنید.",
    });
  }

  let contentFileIds: string[] = [];
  try {
    contentFileIds = collectContentFileIds(JSON.parse(product.content || "[]"));
  } catch {
    contentFileIds = [];
  }
  const galleryFileIds = product.galleryFiles.map((gf) => gf.fileId);

  await prisma.$transaction(async (tx) => {
    await tx.comment.deleteMany({ where: { productId: input.productId } });
    for (const variation of product.ProductVariation) {
      await tx.productVariationValue.deleteMany({
        where: { ProductVariationId: variation.id },
      });
    }
    await tx.productVariation.deleteMany({
      where: { ProductId: input.productId },
    });
    await tx.productGalleryFile.deleteMany({
      where: { productId: input.productId },
    });
    await tx.product.delete({ where: { id: input.productId } });
  });

  for (const fileId of [...new Set([...galleryFileIds, ...contentFileIds])]) {
    try {
      await deleteStoredFile(fileId);
    } catch (error) {
      console.error("Failed deleting product file", fileId, error);
    }
  }

  return { status: "ok" as const };
}

// re-export for callers that may expect firstGalleryImageUrl nearby
export { firstGalleryImageUrl };
