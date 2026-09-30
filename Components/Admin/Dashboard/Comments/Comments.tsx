"use client";

import { trpc } from "@/utils/trpc";
import React from "react";
import CommentItem from "./Item.comments";
import { AdminList } from "../../ui/AdminList";
import AdminLoading from "../../ui/AdminLoading";
import AdminEmpty from "../../ui/AdminEmpty";

export default function Comments() {
  const { data, isLoading } = trpc.comment.comments.useQuery(undefined, {
    gcTime: 0,
    networkMode: "online",
  });

  return (
    <div className="flex flex-col">
      {isLoading ? (
        <AdminLoading />
      ) : data?.comments?.length ? (
        <AdminList>
          {data.comments.map((comment) => (
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
          ))}
        </AdminList>
      ) : (
        <AdminEmpty title="دیدگاهی یافت نشد" />
      )}
    </div>
  );
}
