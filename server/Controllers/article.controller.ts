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
  metaDescription: z.string(),
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
      metaDescription: input.metaDescription,
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
      message: JSON.stringify(error || "{}"),
    });
  }
}

export const editArticleInput = z.object({
  articleId: z.number(),
  title: z.string(),
  images: z.array(imageType),
  // categoryId: z.string(),
  // parentCategories: z.array(z.number()).optional(),
  content: z.array(content),
  metaDescription: z.string(),
});

export type EditArticleInput = z.infer<typeof editArticleInput>;
export async function editArticleController({
  ctx: { prisma },
  input,
}: ArgsStructure<EditArticleInput>) {
  /// edit simple article infos

  try {
    await prisma.article.update({
      where: {
        id: input.articleId,
      },
      data: {
        updated_at: new Date(Date.now()),
        title: input.title,
        metaDescription: input.metaDescription,
      },
    });
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: JSON.stringify(error || "{}"),
    });
  }

  try {
    await uploadFile({
      images: input.images,
      uploadDirectory: "articleMainImages",
    }).then(() => {
      (async () =>
        await prisma.article.update({
          where: { id: input.articleId },
          data: {
            images: input.images.map((img) => img.name),
          },
        }))();
    });
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: JSON.stringify(error || "{}"),
    });
  }

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
            id: input.articleId,
          },
          data: {
            content: JSON.stringify(changedContent),
          },
        }))();
    });
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: JSON.stringify(error || "{}"),
    });
  }
}

export const getArticleInput = z.object({
  articleId: z.number(),
});
type GetArticle = z.infer<typeof getArticleInput>;
export async function getArticleController({
  ctx: { prisma },
  input,
}: ArgsStructure<GetArticle>) {
  try {
    const article = await prisma.article.findUnique({
      where: { id: input.articleId },
      include: { comments: true },
    });

    if (!article) {
      return { article: null, message: "article doesn't found", error: "" };
    }
    const result = {
      id: article.id,
      imageUrls: article.images.map(
        (imgName) =>
          `${process.env.NEXT_PUBLIC_STATIC_FILES_ENDPOINT}/articleMainImages/${imgName}`
      ),
      title: article.title,
      metaDescription: article.metaDescription,
      created_at: article.created_at,
      content: JSON.parse(article.content).map((e: any) => {
        if (e.type === "img") {
          return {
            content: {
              src: `${process.env.NEXT_PUBLIC_STATIC_FILES_ENDPOINT}/articleContentImages/${e.content.name}`,
              name: e.content.name,
            },
            type: "img",
          };
        }
        return e;
      }),
    };
    return { article: result, message: null };
  } catch (error) {
    return { article: null, message: JSON.stringify(error || "{}") };
  }
}

export async function articlesController({ ctx: { prisma } }: ArgsStructure) {
  try {
    const articles = await prisma.article.findMany({
      orderBy: { created_at: "desc" },
    });

    const haveImageArticles = articles.map((article) => ({
      ...article,
      content:
        (
          (JSON.parse(article.content).filter(
            (e: any) => e.type === "p" && e.childs[0].type === "#text"
          )[0]?.childs[0]?.content as string) || ""
        )
          .split(" ")
          .slice(0, 25)
          .join(" ") + "..." || "",
      images: article.images.map(
        (img) =>
          `${process.env.NEXT_PUBLIC_STATIC_FILES_ENDPOINT}/articleMainImages/${img}`
      ),
    }));

    return { articles: haveImageArticles, message: null };
  } catch (error) {
    return { articles: null, message: JSON.stringify(error || "{}") };
  }
}

export async function recentArticlesController({
  ctx: { prisma },
}: ArgsStructure) {
  try {
    const [recentArticles, suggestedArticels] = await prisma.$transaction([
      prisma.article.findMany({
        orderBy: { created_at: "desc" },
        take: 4,
      }),
      prisma.article.findMany({
        where: { isSuggested: true },
        orderBy: { created_at: "desc" },
        take: 3,
      }),
    ]);

    const recentArticlesWithImage = recentArticles.map((article) => ({
      ...article,
      content:
        (
          (JSON.parse(article.content).filter(
            (e: any) => e.type === "p" && e.childs[0].type === "#text"
          )[0]?.childs[0]?.content as string) || ""
        )
          .split(" ")
          .slice(0, 20)
          .join(" ") + "..." || "",
      images: article.images.map(
        (img) =>
          `${process.env.NEXT_PUBLIC_STATIC_FILES_ENDPOINT}/articleMainImages/${img}`
      ),
    }));

    const suggestedArticlesWithImage = suggestedArticels.map((article) => ({
      ...article,
      content: "",
      images: article.images.map(
        (img) =>
          `${process.env.NEXT_PUBLIC_STATIC_FILES_ENDPOINT}/articleMainImages/${img}`
      ),
    }));

    return {
      recentArticles: recentArticlesWithImage,
      suggestedArticels: suggestedArticlesWithImage,
      message: null,
    };
  } catch (error) {
    return { recentArticles: null, suggestedArticels: null, message: null };
  }
}

export async function article_for_sitemap({ ctx: { prisma } }: ArgsStructure) {
  try {
    const articles = await prisma.article.findMany({
      select: { id: true, title: true, updated_at: true, comments: true },
    });

    return { articles, message: null };
  } catch (error) {
    return { articles: null, message: JSON.stringify(error || "{}") };
  }
}
