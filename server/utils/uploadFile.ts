import path from "path";
import fs from "fs";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { prisma } from "../context";
import { rimraf } from "rimraf";

const ACCESSKEY = process.env.LIARA_ACCESS_KEY;
const SECRETKEY = process.env.LIARA_SECRET_KEY;
const ENDPOINT = process.env.LIARA_ENDPOINT;
const BUCKET = process.env.LIARA_BUCKET_NAME;

interface UploadFile {
  images: { name: string; base64: string }[];
  uploadDirectory: string;
}

export default async function uploadFile({
  images,
  uploadDirectory,
}: UploadFile) {
  const client = new S3Client({
    region: "default",
    endpoint: ENDPOINT as string,
    credentials: {
      accessKeyId: ACCESSKEY as string,
      secretAccessKey: SECRETKEY as string,
    },
  });

  const imagePathFolder = path.join("./public/tempUploadDirectory/");
  const dir = fs.mkdir(imagePathFolder, () => {});

  for (let image of images) {
    const decodeImage = Buffer.from(image.base64, "base64");
    try {
      await fs.writeFileSync(`${imagePathFolder}/${image.name}`, decodeImage);
    } catch (error) {
      console.log(error);
    }
  }

  // write product content images
  for (let image of images) {
    const decodeImage = Buffer.from(image.base64, "base64");
    try {
      await fs.writeFileSync(`${imagePathFolder}/${image.name}`, decodeImage);
    } catch (error) {
      console.log(error);
    }
  }


  const handleUpload = async (image: any, imageName: string) => {
    const params = {
      Body: image,
      Bucket: BUCKET,
      Key: `${uploadDirectory}/${imageName}`,
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


    return { status: "ok", result: "files uploaded successfully" };
  } catch (error) {
    console.log(error);
    return { status: "failed", result: "files didn't upload" };
  }
}
