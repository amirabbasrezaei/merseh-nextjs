import { ArgsStructure } from "./category.controller";
import z from "zod";
import { content } from "./product.controller";
import uploadFile from "../utils/uploadFile";
import { TRPCError } from "@trpc/server";
const imageType = z.object({
  base64: z.string(),
  name: z.string(),
});

export const createArticleInput = z.object({
  title: z.string(),

  images: z.array(imageType),
  // categoryId: z.string(),
  // parentCategories: z.array(z.number()).optional(),
  content: z.array(content),
  description: z.array(z.string()),
});

type CreateArticle = z.infer<typeof createArticleInput>;
export async function createArticleController({
  ctx: { prisma },
  input,
}: ArgsStructure<CreateArticle>) {
  const article = await prisma.article.create({
    data: {
      content: JSON.stringify(input.content),
      title: input.title,
    },
  });

  /// handle image upload
  try {
    await uploadFile({
      images: input.images,
      uploadDirectory: "articleMainImages",
    }).then(() => {
      (async () =>
        await prisma.article.update({
          where: {
            id: article.id,
          },
          data: {
            images: input.images.map((img) => img.name),
          },
        }))();
    });

    /// handle content image upload
    try {
      const filterContentImages = input.content.map((e) =>
        typeof e.content !== "string" &&
        e.type === "img" &&
        !e.content.src.includes("https://")
          ? { base64: e.content.src, name: e.content.name }
          : { base64: "", name: "" }
      );
      uploadFile({
        images: filterContentImages,
        uploadDirectory: "articleContentImages",
      }).then(() => {
        const changedContent = input.content.map((e) => {
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

        (async () =>
          await prisma.article.update({
            where: {
              id: article.id,
            },
            data: {
              content: JSON.stringify(changedContent),
            },
          }))();
      });
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: JSON.stringify(error as string),
    });
  }
}
