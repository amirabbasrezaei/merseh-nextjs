import { trpc } from "@/utils/trpc";
import React from "react";
import { motion } from "framer-motion";

import CommentItem from "./Item.comments";

export default function Comments() {
  const { data, isLoading } = trpc.comment.comments.useQuery(undefined, {cacheTime:0, networkMode:"online"});
  return (
    <motion.div>
      {isLoading ? (
        <div></div>
      ) : (
        <div className="flex flex-col gap-5">
          {data?.comments?.length
            ? data.comments.map((comment) => (
                <CommentItem
                selectOptions={data.statusOptions}
                  key={comment.id}
                  currentStatus={comment.status}
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
