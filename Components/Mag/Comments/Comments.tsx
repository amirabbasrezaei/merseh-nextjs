"use client"
import React, { useEffect, useState } from "react";
import Button from "../../Button";
import { z } from "zod";
import { trpc } from "@/utils/trpc";
import Comment from "./Comment";

type Props = {
  articleId: number;
  commentsRef?: React.MutableRefObject<null>;
};

export default function Comments({ commentsRef, articleId }: Props) {
  const [commentInput, setCommentInput] = useState("");

  const {
    data: product_comments_data,
    isLoading: isCommentsLoading,
    refetch,
  } = trpc.article.comments.useQuery({
    articleId: Number(articleId),
  });

  const { data: addCommentData, mutate: mutateAddComment } =
    trpc.article.addComment.useMutation();

  useEffect(() => {
    if (addCommentData?.status === "ok") {
      refetch();
    }
  }, [addCommentData]);

  return (
    <div ref={commentsRef} className="flex flex-col gap-5">
      <label htmlFor="mainNewComment" className="text-[22px] font-[500] text-black1">دیدگاه ها</label>
      {isCommentsLoading ? (
        <div></div>
      ) : product_comments_data?.comments?.length ? (
        <div className="flex flex-col gap-5">
          {product_comments_data.comments.map(
            ({
              id,
              content,
              likes,
              authorName,
              authorLastName,
              child_comments,
              isLiked,
            }) => (
              <Comment
                authorName={authorName}
                authorLastName={authorLastName || ""}
                content={content}
                key={id}
                likes={likes}
                articleId={articleId}
                commentId={id}
                childComments={child_comments}
                isLiked={isLiked}
              />
            )
          )}
        </div>
      ) : (
        <div>
          <span>اولین دیدگاه را شما ثبت کنید</span>
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className="w-full flex flex-col gap-5"
      >
        <textarea
        id="mainNewComment"
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          className="appearance-none p-4 w-full sm:w-[500px] h-[100px] outline-none rounded-[10px] border border-[#ECECEC] bg-[#F9F9F9] "
        />
        <Button
          onClick={() =>
            mutateAddComment({
              content: commentInput,
              articleId: Number(articleId),
            })
          }
          isDisabled={commentInput.length < 3 || commentInput.length > 150}
          isLoading={false}
          type="submit"
          className="w-[170px] h-[40px]"
          text="ارسال نظر"
        />
      </form>
    </div>
  );
}
