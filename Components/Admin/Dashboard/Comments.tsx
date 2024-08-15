import { trpc } from "@/utils/trpc";
import React from "react";
import { motion } from "framer-motion";
import Item from "./Item";
import CommentItem from "./CommentItem";

export default function Comments() {
  const { data, isLoading } = trpc.comment.comments.useQuery();
  return (
    <motion.div>
      {isLoading ? (
        <div></div>
      ) : (
        <div className="flex flex-col gap-5">
          {data?.comments?.length
            ? data.comments.map((comment) => (
                <CommentItem
                  status={comment.status}
                  user_name={comment.User.name}
                  user_lastName={comment.User.familyName || ""}
                  id={String(comment.id)}
                  section={
                    comment.articleId
                      ? "article"
                      : comment.productId
                      ? "product"
                      : ""
                  }
                  sectionName={
                    comment.Article?.title || comment.Product?.name || ""
                  }
                />
              ))
            : null}
        </div>
      )}
    </motion.div>
  );
}
