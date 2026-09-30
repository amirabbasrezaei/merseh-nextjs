import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  deleteStoredFile,
  publicUrl,
  uploadFromBase64,
} from "../utils/storage";
import { ArgsStructure } from "./category.controller";

export const uploadContentImageInput = z.object({
  base64: z.string().min(1),
  name: z.string().min(1),
  folder: z.enum(["product/content", "article/content", "banner"]),
});

export async function uploadContentImageController({
  input,
}: ArgsStructure<z.infer<typeof uploadContentImageInput>>) {
  try {
    const file = await uploadFromBase64(
      { base64: input.base64, name: input.name },
      input.folder
    );
    if (!file) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "آپلود تصویر ناموفق بود",
      });
    }
    return {
      fileId: file.id,
      url: publicUrl(file.key),
      name: file.originalName,
    };
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: String(error),
    });
  }
}

export const deleteContentImageInput = z.object({
  fileId: z.string().uuid(),
});

export async function deleteContentImageController({
  ctx: { prisma },
  input,
}: ArgsStructure<z.infer<typeof deleteContentImageInput>>) {
  try {
    const inProductGallery = await prisma.productGalleryFile.findFirst({
      where: { fileId: input.fileId },
    });
    const inArticleGallery = await prisma.articleGalleryFile.findFirst({
      where: { fileId: input.fileId },
    });
    const inBanner = await prisma.banner.findFirst({
      where: { imageFileId: input.fileId },
    });
    const inCategory = await prisma.category.findFirst({
      where: { imageFileId: input.fileId },
    });

    if (inProductGallery || inArticleGallery || inBanner || inCategory) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "این فایل در گالری یا بنر استفاده شده و قابل حذف نیست",
      });
    }

    await deleteStoredFile(input.fileId);
    return { status: "ok" as const };
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: String(error),
    });
  }
}
