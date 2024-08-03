import React, { useEffect, useState } from "react";
import { Heart_Filled_SVG, Heart_SVG, Reply_SVG } from "../../SVGS";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";

import { FinalComments } from "@/server/Controllers/comment.controller";
import { trpc } from "@/utils/trpc";
import NewComment from "./NewComment";
type CommentProps = {
  content: string;
  likes: number;
  authorName: string;
  authorLastName: string;

  commentId: number;
  childComments: FinalComments[];
  isLiked: boolean;
  articleId: number;
};

export default function Comment({
  content,
  authorName,
  authorLastName,
  likes,
  commentId,
  childComments,
  isLiked,
  articleId,
}: CommentProps) {
  const [showReply, setShowReply] = useState(false);
  const {
    mutate: mutateEditComment,
    data: editCommentData,
    isLoading,
  } = trpc.product.likeComment.useMutation();
  const { refetch: refetchComments } = trpc.article.comments.useQuery({
    articleId: Number(articleId),
  });

  useEffect(() => {
    if (editCommentData) {
      refetchComments();
    }
  }, [editCommentData]);

  return (
    <div className="flex flex-col gap-5">
      <div className="border w-full  py-5 px-5 rounded-[10px] flex flex-col gap-4">
        <div className="flex flex-row justify-between">
          <span className="text-[13px] text-lightBlack">{`${authorName} ${authorLastName}`}</span>
          <div
            onClick={() =>
              mutateEditComment({
                comment_id: commentId,
              })
            }
            className="flex flex-row items-center gap-1 cursor-pointer"
          >
            <span>{likes}</span>
            {isLiked ? (
              <Heart_Filled_SVG classname="w-6 h-auto fill-red-600" />
            ) : (
              <Heart_SVG classname="w-6 h-auto fill-[#727272] stroke-[10px]" />
            )}
          </div>
        </div>
        <p className="text-[16px] text-black1">{content}</p>
        <AnimatePresence mode="sync">
          {!showReply ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              exit={{ height: 0, opacity: 0 }}
              animate={{ height: 40, opacity: 1 }}
              className="w-full flex justify-end"
            >
              <button
                onClick={() => setShowReply(true)}
                className="flex flex-row gap-1 justify-center items-center"
              >
                <Reply_SVG classname="w-4 h-auto stroke-1 fill-[#535353]" />
                <span className="text-[#535353]">پاسخ</span>
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              exit={{ height: 0, opacity: 0 }}
              animate={{ height: 170, opacity: 1 }}
            >
              <NewComment
                setShowReply={setShowReply}
                parentCommentId={commentId}
                articleId={articleId}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex flex-col gap-5">
        {childComments?.length
          ? childComments.map(
              ({
                id,
                content,

                likes,
                child_comments,
                authorName,
                authorLastName,
              }) => (
                <div className="pr-6 " key={id}>
                  <Comment
                    authorName={authorName}
                    authorLastName={authorLastName || ""}
                    content={content}
                    likes={likes}
                    articleId={articleId}
                    commentId={id}
                    childComments={child_comments}
                    isLiked={isLiked}
                  />
                </div>
              )
            )
          : null}
      </div>
    </div>
  );
}
