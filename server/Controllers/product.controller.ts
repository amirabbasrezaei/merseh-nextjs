import { Product } from "@prisma/client";
import { Context } from "../context";
import { z } from "zod";
import fs from "fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import path, { dirname } from "path";
import { TRPCError } from "@trpc/server";

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
  productId: z.string(),
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
      id: z.string(),
      name: z.string(),
      imageUrls: z.array(z.string()),
      price: z.number(),
      variations: z.array(productVariationForPayload),
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
}: ProductRouterArgsController<GetProductInputArgs>): Promise<GetProductPayloadType> {
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
      return { message: "product doesn't found", error: "" };
    }
    const result = {
      id: String(product.id),
      imageUrls: product.imageNames.map(
        (imgName) =>
          `${process.env.NEXT_PUBLIC_STATIC_FILES_ENDPOINT}/productImages/${imgName}`
      ),
      name: product.name,
      price: product.price || 0,
      variations: product.ProductVariation.map((variation) => ({
        id: variation.id,
        variationName: variation.variateName,
        variations: variation.values.map((variationValue) => ({
          name: variationValue.name,
          price: variationValue.price,
          id: variationValue.id,
        })),
      })),
    };
    return { product: result, message: "ok" };
  } catch (error) {
    return { message: "error while finding product", error: String(error) };
  }
}

const imageType = z.object({
  base64: z.string(),
  name: z.string(),
});

export const AddProductControllerArgSchema = z.object({
  name: z.string(),
  price: z.string(),
  images: z.array(imageType),
  categoryId: z.string(),
  parentCategories: z.array(z.number()).optional(),
  productVariations: z.array(productVariation).optional(),
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
  const dir = fs.mkdir(imagePathFolder, () => {
    // if (err) {
    //   console.error(err);
    // }
    console.log("Directory created successfully!");
  });
  for (let image of input.images) {
    const decodeImage = Buffer.from(image.base64, "base64");

    await fs.writeFileSync(`${imagePathFolder}/${image.name}`, decodeImage);
  }

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

  function readFiles(dirname: any) {
    fs.readdir(dirname, (err, filenames) => {
      if (err) {
        throw new Error(err as any);
      }
      filenames.forEach((fileName) => {
        try {
          const image = fs.readFileSync(`${dirname}\\${fileName}`);

          handleUpload(image, fileName);

          return { status: "ok" };
        } catch (error) {
          throw new Error(error as any);
        }
      });
    });
  }

  try {
    readFiles(imagePathFolder);
    console.log(input.categoryId, input?.parentCategories);
    const newproduct = await prisma.product.create({
      data: {
        imageNames: input.images.map((img) => img.name),
        name: input.name,
        price: Number(input.price),
        category: {
          connect: input?.parentCategories?.length
            ? [
                ...input.parentCategories.map((catId) => ({
                  id: Number(catId),
                })),
                { id: Number(input.categoryId) },
              ]
            : { id: Number(input.categoryId) },
        },
        ProductVariation: input.productVariations?.length
          ? {
              create: input.productVariations.map((variation) => ({
                variateName: variation.variationName,
                value: {
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
      include: {
        category: true,
      },
    });

    await fs.rmSync(imagePathFolder, { recursive: true, force: true });
    console.log("product added succesfully");
    return { status: "ok", result: newproduct };
  } catch (error) {
    console.log(error);
  }
}
