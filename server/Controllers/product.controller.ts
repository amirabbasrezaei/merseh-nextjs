import { Product } from "@prisma/client";
import { Context } from "../context";
import { z } from "zod";
import fs from "fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import path, { dirname } from "path";
import { ArgsStructure } from "./category.controller";
import { rimraf } from "rimraf";
import uploadFile from "../utils/uploadFile";
import { parentCategories } from "../utils/category";
const ACCESSKEY = process.env.LIARA_ACCESS_KEY;
const SECRETKEY = process.env.LIARA_SECRET_KEY;
const ENDPOINT = process.env.LIARA_ENDPOINT;
const BUCKET = process.env.LIARA_BUCKET_NAME;

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

export const content = z.object({
  content: z
    .string()
    .or(z.object({ src: z.string(), name: z.string(), format: z.string() })),
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
      content: z.array(content),
    })
    .optional(),

  message: z.string(),
  error: z.string().optional(),
});

type GetProductPayloadType = z.infer<typeof getProductPayloadSchema>;

type GetProductInputArgs = z.infer<typeof getProductInputSchema>;

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
        imageNames: true,
        price: true,
        content: true,
        quantity: true,
        discount: true,
        engName: true,
        category: true,
        mainCategoryId: true,
        metaDescription: true,
        details: true,
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
      return { product: null, message: "product doesn't found", error: "" };
    }
    const result = {
      id: product.id,
      imageUrls: product.imageNames.map(
        (imgName) =>
          `${process.env.NEXT_PUBLIC_STATIC_FILES_ENDPOINT}/productImages/${imgName}`
      ),
      name: product.name,
      englishName: product.engName,
      price: product.price || 0,
      details: product.details,
      metaDescription: product.metaDescription,
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
      content: JSON.parse(product.content).map((e: any) => {
        if (e.type === "img") {
          return {
            content: {
              src: `${process.env.NEXT_PUBLIC_STATIC_FILES_ENDPOINT}/articleImages/${e.content.name}`,
              name: e.content.name,
            },
            type: "img",
          };
        }
        return e;
      }),
      instock: product.quantity ? true : false,
      discount: product.discount,
      category: product.category,
      mainCategoryId: product.mainCategoryId,
    };
    return { product: result, message: "ok" };
  } catch (error) {
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
  productContent: z.array(content),
  details: z.array(z.string()),
  metaDescription: z.string(),
});

type AddProductControllerArg = z.infer<typeof AddProductControllerArgSchema>;
export async function addProductController({
  input,
  ctx,
}: ProductRouterArgsController<AddProductControllerArg>) {
  const { prisma } = ctx;
  const client = new S3Client({
    region: "default",
    endpoint: ENDPOINT as string,
    credentials: {
      accessKeyId: ACCESSKEY as string,
      secretAccessKey: SECRETKEY as string,
    },
  });

  const imagePathFolder = path.join("./public/Images/" + "addProductImages/");
  const dir = fs.mkdir(imagePathFolder, () => {});
  // write product images
  for (let image of input.images) {
    const decodeImage = Buffer.from(image.base64, "base64");
    try {
      await fs.writeFileSync(`${imagePathFolder}/${image.name}`, decodeImage);
    } catch (error) {
      console.log(error);
    }
  }

  // write product content images
  for (let image of input.productContent.filter((e) => e.type === "image")) {
    // @ts-ignore
    const decodeImage = Buffer.from(image.content.src as string, "base64");
    try {
      await fs.writeFileSync(
        // @ts-ignore
        `${imagePathFolder}/${image.content.name}`,
        decodeImage
      );
    } catch (error) {
      console.log(error);
    }
  }

  // change base64 string with image url for product content
  const withImageUrl = input.productContent.map((e) => {
    if (e.type === "image") {
      return {
        type: "image",
        // @ts-ignore
        content: e.content.name,
      };
    }
    return e;
  });

  const handleUpload = async (image: any, imageName: string) => {
    const params = {
      Body: image,
      Bucket: BUCKET,
      Key: "productImages/" + imageName,
    };

    client.send(new PutObjectCommand(params), (error, data) => {
      if (error) {
        console.log(error);
      } else {
        // console.log(data);
      }
    });
  };

  function readProductImageFiles(dirname: any) {
    fs.readdir(dirname, (err, filenames) => {
      if (err) {
        throw new Error(err as any);
      }
      filenames.forEach((fileName) => {
        try {
          const image = fs.readFileSync(`${dirname}${fileName}`);

          handleUpload(image, fileName).then(() => {
            rimraf(imagePathFolder);
            return { status: "ok" };
          });
        } catch (error) {
          throw new Error(error as any);
        }
      });
    });
  }

  try {
    readProductImageFiles(imagePathFolder);
    const parent_categories = await parentCategories({
      categoryId: Number(input.categoryId),
    });
    const newproduct = await prisma.product.create({
      data: {
        imageNames: input.images.map((img) => img.name),
        metaDescription: input.metaDescription,
        name: input.name,
        price: Number(input.price),
        engName: input.englishName,
        mainCategoryId: Number(input.categoryId),
        details: input.details,
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
        content: JSON.stringify(withImageUrl),
      },
      include: {
        category: true,
      },
    });

    console.log("product added succesfully");
    return { status: "ok", result: newproduct };
  } catch (error) {
    console.log(error);
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
        imageNames: true,
      },
    });
    if (findProduct) {
      const result = {
        imageUrls: findProduct.imageNames.map(
          (imgName) =>
            `${process.env.NEXT_PUBLIC_STATIC_FILES_ENDPOINT}/productImages/${imgName}`
        ),
      };
      return { result, error: null };
    }
    return { result: null, error: "no product with this id" };
  } catch (error) {
    return { result: null, error };
  }
}

export async function productCarouselController({
  ctx: { prisma },
}: ArgsStructure) {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return { products, status: "ok", error: null };
  } catch (error) {
    return { products: [], status: "failed", error };
  }
}

export async function productsController({ ctx }: ArgsStructure) {
  const { prisma } = ctx;
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return { products: products, error: null };
  } catch (error) {
    return { products: [], error };
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
  productContent: z.array(content),
  productId: z.string(),
  metaDescription: z.string(),
  details: z.array(z.string()),
});

export type EditProductInput = z.infer<typeof editProductInputSchema>;
export async function editProductController({
  ctx,
  input,
}: ArgsStructure<EditProductInput>) {
  const { prisma } = ctx;
  try {
    uploadFile({
      images: input.images.newImages,
      uploadDirectory: "productImages",
    });
  } catch (error) {
    console.log(error);
  }

  try {
    const filterContentImages = input.productContent.map((e) =>
      typeof e.content !== "string" &&
      e.type === "img" &&
      !e.content.src.includes("https://")
        ? { base64: e.content.src, name: e.content.name }
        : { base64: "", name: "" }
    );
    uploadFile({
      images: filterContentImages,
      uploadDirectory: "articleImages",
    });
  } catch (error) {
    console.log(error);
  }

  const productImageStructure = input.productContent.map((e) => {
    if (typeof e.content !== "string" && e.type === "img") {
      return {
        content: {
          name: e.content?.name
            ? e.content.name
            : e.content.src.split("/").at(-1),
        },
        type: e.type,
      };
    }
    return e;
  });

  const parent_categories = await parentCategories({
    categoryId: Number(input.categoryId),
  });
  await prisma.product.update({
    where: {
      id: Number(input.productId),
    },
    data: {
      imageNames: [
        ...input.images.existingImages,
        ...input.images.newImages.map((e) => e.name),
      ],
      metaDescription: input.metaDescription,
      name: input.name,
      price: Number(input.price),
      content: JSON.stringify(productImageStructure),
      engName: input.englishName,
      mainCategoryId: Number(input.categoryId),
      details: input.details,
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
}
