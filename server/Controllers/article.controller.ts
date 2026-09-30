import { ArgsStructure } from "./category.controller";
import z from "zod";
import {
  CallToActionProductType,
  ContentType,
  ContentStatusSchema,
  isImageContent,
} from "./product.controller";
import { TRPCError } from "@trpc/server";
import {
  galleryImageUrls,
  galleryInclude,
  publicUrl,
  uploadFromBase64,
  uploadManyFromBase64,
  firstGalleryImageUrl,
  deleteStoredFile,
} from "../utils/storage";

const PUBLISHED = "PUBLISHED" as const;

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

const imageType = z.object({
  base64: z.string(),
  name: z.string(),
});

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

async function resolveContentImagesForRead(prisma: any, nodes: any[]) {
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

function mapArticleWithGalleryUrls<T extends { galleryFiles?: any[] }>(
  article: T
) {
  const urls = galleryImageUrls(article.galleryFiles);
  const { galleryFiles, ...rest } = article as T & { galleryFiles?: any[] };
  return {
    ...rest,
    images: urls,
    imageUrls: urls,
    imageFileIds: (galleryFiles || []).map((gf: any) => gf.fileId),
  };
}

export const createArticleInput = z.object({
  title: z.string(),
  images: z.array(imageType),
  content: z.array(ContentType),
  metaDescription: z.string(),
  englishTitle: z.string(),
});

type CreateArticle = z.infer<typeof createArticleInput>;

export async function createArticleController({
  ctx: { prisma },
  input,
}: ArgsStructure<CreateArticle>) {
  try {
    const galleryFiles = await uploadManyFromBase64(
      input.images,
      "article/gallery"
    );
    const persistedContent = await persistContentImages(
      input.content,
      "article/content"
    );

    const article = await prisma.article.create({
      data: {
        content: JSON.stringify(persistedContent),
        title: input.title,
        englishTitle: input.englishTitle,
        metaDescription: input.metaDescription,
        status: "DRAFT",
        galleryFiles: {
          create: galleryFiles.map((file, index) => ({
            fileId: file.id,
            sortOrder: index,
          })),
        },
      },
      include: galleryInclude(),
    });

    return { article: mapArticleWithGalleryUrls(article), message: null };
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
  content: z.array(ContentType),
  metaDescription: z.string(),
  englishTitle: z.string(),
});

export type EditArticleInput = z.infer<typeof editArticleInput>;

export async function editArticleController({
  ctx: { prisma },
  input,
}: ArgsStructure<EditArticleInput>) {
  try {
    const persistedContent = await persistContentImages(
      input.content,
      "article/content"
    );

    const data: any = {
      updated_at: new Date(Date.now()),
      title: input.title,
      metaDescription: input.metaDescription,
      englishTitle: input.englishTitle,
      content: JSON.stringify(persistedContent),
    };

    if (input.images?.length) {
      const galleryFiles = await uploadManyFromBase64(
        input.images,
        "article/gallery"
      );
      const existingCount = await prisma.articleGalleryFile.count({
        where: { articleId: input.articleId },
      });
      data.galleryFiles = {
        create: galleryFiles.map((file, index) => ({
          fileId: file.id,
          sortOrder: existingCount + index,
        })),
      };
    }

    await prisma.article.update({
      where: { id: input.articleId },
      data,
    });

    return { status: "ok" };
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
  ctx,
  input,
}: ArgsStructure<GetArticle>) {
  const { prisma } = ctx;
  try {
    const article = await prisma.article.findUnique({
      where: { id: input.articleId },
      include: { comments: true, ...galleryInclude() },
    });

    if (!article) {
      throw new TRPCError({ code: "NOT_FOUND", message: "مقاله یافت نشد" });
    }

    const admin = isAdminUser(ctx.user);
    if (article.status !== PUBLISHED && !admin) {
      throw new TRPCError({ code: "NOT_FOUND", message: "مقاله یافت نشد" });
    }

    const prepareContent = async (content: any) => {
      const resolved = await resolveContentImagesForRead(prisma, content);
      const resultContent: any[] = [];

      for (let node of resolved) {
        if (
          node.type === "p" &&
          node.childs?.length &&
          typeof node.childs[0]?.content === "string" &&
          node.childs[0].content.includes("/ctap/")
        ) {
          const get_ids: number[] = node.childs[0].content
            .replace("/ctap/", "")
            .replace("/*ctap/", "")
            .split(",")
            .map((e: any) => Number(e));

          try {
            const get_products = await prisma.product.findMany({
              where: {
                id: { in: get_ids },
                status: PUBLISHED,
              },
              include: galleryInclude(),
            });
            resultContent.push({
              type: "p",
              content: "",
              childs: [
                {
                  type: "#text",
                  content: `/ctap/${JSON.stringify(
                    get_products.map((pr) => ({
                      price: pr.price,
                      product_id: pr.id,
                      product_name: pr.name,
                      imageurl: firstGalleryImageUrl(pr.galleryFiles),
                    })) as z.infer<typeof CallToActionProductType>[]
                  )}/*ctap/`,
                  childs: [],
                },
              ],
            });
          } catch (error) {
            console.log(error);
          }
        } else {
          resultContent.push(node);
        }
      }
      return resultContent;
    };

    const imageUrls = galleryImageUrls(article.galleryFiles);
    const result = {
      id: article.id,
      imageUrls,
      images: imageUrls,
      imageFileIds: article.galleryFiles.map((gf) => gf.fileId),
      title: article.title,
      metaDescription: article.metaDescription,
      created_at: article.created_at,
      updated_at: article.updated_at,
      englishTitle: article.englishTitle,
      status: article.status,
      isPreview: article.status !== PUBLISHED,
      content: await prepareContent(JSON.parse(article.content)),
    };

    return { article: result, message: null };
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    return { article: null, message: JSON.stringify(error || "{}") };
  }
}

export async function getArticleController_admin({
  ctx: { prisma },
  input,
}: ArgsStructure<GetArticle>) {
  try {
    const article = await prisma.article.findUnique({
      where: { id: input.articleId },
      include: { comments: true, ...galleryInclude() },
    });

    if (!article) {
      return { article: null, message: "article doesn't found", error: "" };
    }

    const imageUrls = galleryImageUrls(article.galleryFiles);
    const result = {
      id: article.id,
      imageUrls,
      images: imageUrls,
      imageFileIds: article.galleryFiles.map((gf) => gf.fileId),
      title: article.title,
      metaDescription: article.metaDescription,
      created_at: article.created_at,
      updated_at: article.updated_at,
      englishTitle: article.englishTitle,
      status: article.status,
      content: await resolveContentImagesForRead(
        prisma,
        JSON.parse(article.content)
      ),
    };
    return { article: result, message: null };
  } catch (error) {
    return { article: null, message: JSON.stringify(error || "{}") };
  }
}

export async function articlesController({ ctx: { prisma } }: ArgsStructure) {
  try {
    const articles = await prisma.article.findMany({
      where: { status: PUBLISHED },
      orderBy: { created_at: "desc" },
      include: galleryInclude(),
    });

    const haveImageArticles = articles.map((article) => ({
      ...mapArticleWithGalleryUrls(article),
      content:
        (
          (JSON.parse(article.content).filter(
            (e: any) => e.type === "p" && e.childs?.[0]?.type === "#text"
          )[0]?.childs[0]?.content as string) || ""
        )
          .split(" ")
          .slice(0, 25)
          .join(" ") + "..." || "",
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
        where: { status: PUBLISHED },
        orderBy: { created_at: "desc" },
        take: 4,
        include: galleryInclude(),
      }),
      prisma.article.findMany({
        where: { isSuggested: true, status: PUBLISHED },
        orderBy: { created_at: "desc" },
        take: 3,
        include: galleryInclude(),
      }),
    ]);

    const recentArticlesWithImage = recentArticles.map((article) => ({
      ...mapArticleWithGalleryUrls(article),
      content:
        (
          (JSON.parse(article.content).filter(
            (e: any) => e.type === "p" && e.childs?.[0]?.type === "#text"
          )[0]?.childs[0]?.content as string) || ""
        )
          .split(" ")
          .slice(0, 20)
          .join(" ") + "..." || "",
    }));

    const suggestedArticlesWithImage = suggestedArticels.map((article) => ({
      ...mapArticleWithGalleryUrls(article),
      content: "",
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
      where: { status: PUBLISHED },
      select: {
        id: true,
        title: true,
        englishTitle: true,
        updated_at: true,
        comments: true,
      },
    });

    return { articles, message: null };
  } catch (error) {
    return { articles: null, message: JSON.stringify(error || "{}") };
  }
}

export const adminArticlesListInput = z
  .object({
    status: ContentStatusSchema.optional(),
  })
  .optional();

export async function adminArticlesListController({
  ctx: { prisma },
  input,
}: ArgsStructure<z.infer<typeof adminArticlesListInput>>) {
  try {
    const articles = await prisma.article.findMany({
      where: input?.status ? { status: input.status } : undefined,
      select: {
        id: true,
        title: true,
        status: true,
        updated_at: true,
        englishTitle: true,
        comments: { select: { id: true } },
      },
      orderBy: { updated_at: "desc" },
    });

    return {
      articles,
      statusOptions: [
        { value: "DRAFT", title: "پیش‌نویس" },
        { value: "PUBLISHED", title: "منتشر شده" },
        { value: "ARCHIVED", title: "آرشیو" },
      ],
      message: null,
    };
  } catch (error) {
    return {
      articles: null,
      statusOptions: null,
      message: JSON.stringify(error || "{}"),
    };
  }
}

export const setArticleStatusInput = z.object({
  articleId: z.number(),
  status: ContentStatusSchema,
});

export async function setArticleStatusController({
  ctx: { prisma },
  input,
}: ArgsStructure<z.infer<typeof setArticleStatusInput>>) {
  const article = await prisma.article.update({
    where: { id: input.articleId },
    data: { status: input.status, updated_at: new Date() },
    select: { id: true, status: true },
  });
  return { article };
}

export const deleteArticleInput = z.object({
  articleId: z.number(),
});

export async function deleteArticleController({
  ctx: { prisma },
  input,
}: ArgsStructure<z.infer<typeof deleteArticleInput>>) {
  const article = await prisma.article.findUnique({
    where: { id: input.articleId },
    include: galleryInclude(),
  });
  if (!article) {
    throw new TRPCError({ code: "NOT_FOUND", message: "مقاله یافت نشد" });
  }

  let contentFileIds: string[] = [];
  try {
    contentFileIds = collectContentFileIds(JSON.parse(article.content || "[]"));
  } catch {
    contentFileIds = [];
  }
  const galleryFileIds = article.galleryFiles.map((gf) => gf.fileId);

  await prisma.$transaction(async (tx) => {
    await tx.comment.deleteMany({ where: { articleId: input.articleId } });
    await tx.articleGalleryFile.deleteMany({
      where: { articleId: input.articleId },
    });
    await tx.article.delete({ where: { id: input.articleId } });
  });

  for (const fileId of [...new Set([...galleryFileIds, ...contentFileIds])]) {
    try {
      await deleteStoredFile(fileId);
    } catch (error) {
      console.error("Failed deleting article file", fileId, error);
    }
  }

  return { status: "ok" as const };
}
