import { Product } from "@prisma/client";
import { Context } from "../context";
import { z } from "zod";
import fs from "fs";
import { S3 } from "aws-sdk";
import { Buckets } from "aws-sdk/clients/s3";
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
      imageUrl: true,
      price: true,
    },
  });
  return products;
}

const imageType = z.object({
  base64: z.string(),
  name: z.string(),
});

export const AddProductControllerArgSchema = z.object({
  name: z.string(),
  price: z.string(),
  images: z.array(imageType),
  categoryId: z.string().optional(),
});

type AddProductControllerArg = z.infer<typeof AddProductControllerArgSchema>;
export function addProductController({
  input,
}: ProductRouterArgsController<AddProductControllerArg>) {
  const ACCESSKEY = process.env.LIARA_ACCESS_KEY;
  const SECRETKEY = process.env.LIARA_SECRET_KEY;
  const ENDPOINT = process.env.LIARA_ENDPOINT;
  const BUCKET = process.env.LIARA_BUCKET_NAME;

  let buckets: Buckets | undefined;
  console.log(input.images.length)
  // for (let image of input.images) {
  //   const decodeImage = Buffer.from(image.base64, "base64");
  //   fs.writeFileSync(`./addproductImages/${image.name}.png`, decodeImage);
  // }
  // const file = fs.readFileSync();

  // const handleUpload = async () => {
  //   try {
  //     if (!file) {
  //       setError("Please select a file");
  //       return;
  //     }

  //     const s3 = new S3({
  //       accessKeyId: ACCESSKEY,
  //       secretAccessKey: SECRETKEY,
  //       endpoint: ENDPOINT,
  //     });

  //     const params = {
  //       Bucket: BUCKET,
  //       Key: file.name,
  //       Body: file,
  //     };

  //     const response = await s3.upload(params).promise();
  //     const signedUrl = s3.getSignedUrl("getObject", {
  //       Bucket: BUCKET,
  //       Key: file.name,
  //       Expires: 3600,
  //     });

  //     setUploadLink(signedUrl);

  //     // Get permanent link
  //     const permanentSignedUrl = s3.getSignedUrl("getObject", {
  //       Bucket: BUCKET,
  //       Key: file.name,
  //       Expires: 31536000, // 1 year
  //     });
  //     setPermanentLink(permanentSignedUrl);

  //     // Update list of uploaded files
  //     setUploadedFiles((prevFiles) => [...prevFiles, response]);

  //     // Update list of all files
  //     fetchAllFiles();

  //     console.log("File uploaded successfully");
  //   } catch (error) {
  //     setError("Error uploading file: " + error.message);
  //   }
  // };
}
