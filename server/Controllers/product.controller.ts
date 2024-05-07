import { Product } from "@prisma/client";
import { Context } from "../context";
import { z } from "zod";
import fs from "fs";
import { S3 } from "aws-sdk";
import { Buckets } from "aws-sdk/clients/s3";
import path from "path";

const ACCESSKEY = process.env.LIARA_ACCESS_KEY;
const SECRETKEY = process.env.LIARA_SECRET_KEY;
const ENDPOINT = process.env.LIARA_ENDPOINT;
const BUCKET = process.env.LIARA_BUCKET_NAME;

require("aws-sdk/lib/maintenance_mode_message").suppress = true;
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
  categoryId: z.string().optional(),
});

type AddProductControllerArg = z.infer<typeof AddProductControllerArgSchema>;
export function addProductController({
  input,
  ctx
}: ProductRouterArgsController<AddProductControllerArg>) {
  const {prisma} = ctx

  let buckets: Buckets | undefined;

  const imagePathFolder = path.join(__dirname, "addProductImages");
  const dir = fs.mkdir(imagePathFolder, () => {
    // if (err) {
    //   console.error(err);
    // }
    console.log("Directory created successfully!");
  });
  for (let image of input.images) {
    const decodeImage = Buffer.from(image.base64, "base64");

    fs.writeFileSync(`${imagePathFolder}/${image.name}`, decodeImage);
  }

  const handleUpload = async (image: any, imageName: string) => {
    if (!image) {
      console.log("Please select a file");
      return;
    }
    try {
      const s3 = new S3({
        accessKeyId: ACCESSKEY,
        secretAccessKey: SECRETKEY,
        endpoint: ENDPOINT,
      });

      const params = {
        Bucket: BUCKET,
        Key: "images/" + imageName,
        Body: image,
        ACL: "public-read",
      };

      const response = await s3.upload(params as any).promise();
      const signedUrl = s3.getSignedUrl("getObject", {
        Bucket: BUCKET,
        Key: imageName,
        Expires: 3600,
      });

      console.log("getSignedUrl:", signedUrl);

      // Get permanent link
      const permanentSignedUrl = s3.getSignedUrl("getObject", {
        Bucket: BUCKET,
        Key: imageName,
        Expires: 31536000, // 1 year
      });
      return true
    } catch (error) {
      console.log(error);
    }
  };

  function readFiles(dirname: any) {
    
    fs.readdir(dirname, (err, filenames) => {
      if (err) {
        new Error(err as any);
        return;
      }
      filenames.forEach((fileName) => {
        try {
          fs.readFile(
            `${dirname}\\${fileName}`,
            "utf-8",
            function (err, content) {
              if (err) {
                return;
              }
  
              handleUpload(content, fileName);
            }
          );

          

          return {status: "ok", }
        } catch (error) {
          
        }
        
      });
    });

    prisma.product.create({
      data:{
        imageNames:  input.images.map((img) => img.name),
        name: input.name,
        price: Number(input.price),
        
      }
    })
  }

  readFiles(imagePathFolder);
}
