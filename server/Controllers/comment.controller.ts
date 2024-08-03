import { TRPCError } from "@trpc/server";
import { ArgsStructure } from "./category.controller";
import z from "zod";
import type { Comment } from "@prisma/client";

export const add_product_comment_schema = z.object({
  productId: z.number(),
  parentCommentId: z.number().optional(),
  content: z.string(),
});

type AddProductCommentInput = z.infer<typeof add_product_comment_schema>;

export async function add_proudct_comment_controller({
  ctx,
  input,
}: ArgsStructure<AddProductCommentInput>) {
  const { prisma, user } = ctx;
  try {
    await prisma.comment.create({
      data: {
        userId: user.userId,
        content: input.content,
        parent_comment_id: input.parentCommentId,
        productId: input.productId,
      },
    });

    return { status: "ok" };
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "خطا در افزودن نظر",
    });
  }
}

export const add_article_comment_schema = z.object({
  articleId: z.number(),
  parentCommentId: z.number().optional(),
  content: z.string(),
});

type AddArticleCommentInput = z.infer<typeof add_article_comment_schema>;

export async function add_article_comment_controller({
  ctx,
  input,
}: ArgsStructure<AddArticleCommentInput>) {
  const { prisma, user } = ctx;
  try {
    await prisma.comment.create({
      data: {
        userId: user.userId,
        content: input.content,
        parent_comment_id: input.parentCommentId,
        articleId: input.articleId,
      },
    });

    return { status: "ok" };
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "خطا در افزودن نظر",
    });
  }
}

export type FinalComments = {
  id: number;
  authorName: string;
  authorLastName: string;
  content: string;
  likes: number;
  parent_comment_id: number | null;
  child_comments: FinalComments[];
  isLiked: boolean;
};

function generateCommentsTree(
  comments: any[],
  parentId: number | undefined,
  userId: string | undefined
) {
  const finalComment: FinalComments[] = [];
  if (!comments.length) return finalComment;
  // console.log(userId)
  for (let i = 0; i < comments.length; i++) {
    if (parentId === comments[i].parent_comment_id) {
      let tempParentComment: FinalComments = {
        id: comments[i].id,
        content: comments[i].content,
        likes: comments[i].likes.length,
        parent_comment_id: comments[i].parent_comment_id,
        child_comments: generateCommentsTree(
          [...comments.slice(0, i), ...comments.slice(i + 1)],
          comments[i].id,
          userId
        ),
        authorName: comments[i].User.name,
        authorLastName: comments[i].User.familyName,
        isLiked:
          userId && comments[i].likes.find((user: any) => user.id === userId)
            ? true
            : false,
      };
      finalComment.push(tempParentComment);
    } else if (
      comments[i].parent_comment_id === null &&
      parentId === undefined
    ) {
      finalComment.push({
        id: comments[i].id,
        content: comments[i].content,
        isLiked:
          userId && comments[i].likes.find((user: any) => user.id === userId)
            ? true
            : false,
        likes: comments[i].likes.length,
        parent_comment_id: comments[i].parent_comment_id,
        child_comments: generateCommentsTree(
          [...comments.slice(0, i), ...comments.slice(i + 1)],
          comments[i].id,
          userId
        ),
        authorName: comments[i].User.name,
        authorLastName: comments[i].User.familyName,
      });
    }
  }

  return finalComment;
}

export const product_comments_schema = z.object({
  productId: z.number(),
});
type ProductComments = z.infer<typeof product_comments_schema>;
export async function get_product_comments({
  ctx,
  input,
}: ArgsStructure<ProductComments>) {
  const { prisma, user } = ctx;
  try {
    const comments = await prisma.comment.findMany({
      where: {
        productId: input.productId,
      },
      include: {
        User: {
          select: {
            name: true,
            familyName: true,
          },
        },
        likes: true,
        parent_comment: {
          select: {
            id: true,
          },
        },
        child_comments: {
          include: {
            User: {
              select: {
                name: true,
                familyName: true,
              },
            },
          },
        },
      },
    });

    return {
      comments: generateCommentsTree(comments, undefined, user?.userId),
    };
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "خطا در دریافت نظرات",
    });
  }
}

export const article_comments_schema = z.object({
  articleId: z.number(),
});
type ArticleComments = z.infer<typeof article_comments_schema>;
export async function get_article_comments({
  ctx,
  input,
}: ArgsStructure<ArticleComments>) {
  const { prisma, user } = ctx;
  try {
    const comments = await prisma.comment.findMany({
      where: {
        articleId: input.articleId,
        status: "APPROVED",
      },
      include: {
        User: {
          select: {
            name: true,
            familyName: true,
          },
        },
        likes: true,
        parent_comment: {
          select: {
            id: true,
          },
        },
        child_comments: {
          include: {
            User: {
              select: {
                name: true,
                familyName: true,
              },
            },
          },
        },
      },
    });

    return {
      comments: generateCommentsTree(comments, undefined, user?.userId),
    };
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "خطا در دریافت نظرات",
    });
  }
}

export const editCommentSchema = z.object({
  comment_id: z.number(),
  deleteComment: z.boolean(),
});

type EditCommentInput = z.infer<typeof editCommentSchema>;
export async function editCommentController({
  ctx: { prisma, user },
  input,
}: ArgsStructure<EditCommentInput>) {
  if (input.deleteComment) {
    try {
      await prisma.comment.update({
        where: {
          userId: user.userId,
          id: input.comment_id,
        },
        data: {
          status: "NOT_SHOWN",
        },
      });

      return { message: "دیدگاه حذف شد" };
    } catch (error) {
      return { message: "این دیدگاه وجود ندارد" };
    }
  }
}

export const likeCommentSchema = z.object({
  comment_id: z.number(),
});

type LikeCommentInput = z.infer<typeof likeCommentSchema>;
export async function likeCommentController({
  ctx: { prisma, user },
  input,
}: ArgsStructure<LikeCommentInput>) {
  try {
    const comment = await prisma.comment.findUnique({
      where: {
        id: input.comment_id,
      },
      include: {
        likes: {
          select: {
            id: true,
          },
        },
      },
    });

    if (comment?.likes.find((e) => e.id === user.userId)?.id) {
      await prisma.comment.update({
        where: {
          id: input.comment_id,
        },
        data: {
          likes: { disconnect: { id: user.userId } },
        },
      });
      return { message: "like cleared" };
    }

    await prisma.comment.update({
      where: {
        id: input.comment_id,
      },
      data: {
        likes: { connect: { id: user.userId } },
      },
    });
    return { message: "liked" };
  } catch (error) {}
}
