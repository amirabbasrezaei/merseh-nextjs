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

export async function getProductsController({
  ctx,
}: ProductRouterArgsController) {
  const products = await ctx.prisma.product.findMany({
    select: {
      id: true,
      name: true,
      imageNames: true,
      price: true,
    },
  });
  return products;
}

const imageType = z.object({
  base64: z.string(),
  name: z.string(),
});

type ImageType = z.infer<typeof imageType>;

export const AddProductControllerArgSchema = z.object({
  name: z.string(),
  price: z.string(),
  images: z.array(imageType),
  categoryId: z.string(),
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

  const imagePathFolder = path.join("./public/Images/" + "addProductImages/")
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
    console.log(image)
    const params = {
      Body: image,
      Bucket: BUCKET,
      Key: "productImages/" + imageName,
    };

    client.send(new PutObjectCommand(params), (error, data) => {
      if (error) {
        console.log(error);
      } else {
        console.log(data);
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

            const image =  fs.readFileSync(`${dirname}\\${fileName}`);

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
    await prisma.product.create({
      data: {
        imageNames: input.images.map((img) => img.name),
        name: input.name,
        price: Number(input.price),
        category: {
          connect:{
            id: Number(input.categoryId)
          }
        }
      },
    });
    await fs.rmSync(imagePathFolder, { recursive: true, force: true });
    console.log("product added succesfully");
    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
}
