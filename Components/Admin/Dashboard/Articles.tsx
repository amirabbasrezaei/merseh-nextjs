"use client";

import { trpc } from "@/utils/trpc";
import React, { useState } from "react";
import Item from "./Item";
import AdminPageHeader from "../ui/AdminPageHeader";
import AdminLinkButton from "../ui/AdminLinkButton";
import AdminSelect from "../ui/AdminSelect";
import { AdminList } from "../ui/AdminList";
import AdminLoading from "../ui/AdminLoading";
import AdminEmpty from "../ui/AdminEmpty";

export default function Articles() {
  const [statusFilter, setStatusFilter] = useState<
    "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined
  >(undefined);
  const { data, isLoading } = trpc.article.adminList.useQuery(
    statusFilter ? { status: statusFilter } : undefined
  );

  return (
    <div className="flex flex-col">
      <AdminPageHeader
        filters={
          <AdminSelect
            className="!w-auto min-w-[140px] py-1.5"
            value={statusFilter || ""}
            onChange={(e) =>
              setStatusFilter(
                (e.target.value || undefined) as
                  | "DRAFT"
                  | "PUBLISHED"
                  | "ARCHIVED"
                  | undefined
              )
            }
          >
            <option value="">همه وضعیت‌ها</option>
            {(data?.statusOptions || []).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.title}
              </option>
            ))}
          </AdminSelect>
        }
        actions={
          <AdminLinkButton href="/admin/article">افزودن مقاله</AdminLinkButton>
        }
      />
      {isLoading ? (
        <AdminLoading />
      ) : data?.articles?.length ? (
        <AdminList>
          {data.articles.map((article) => (
            <Item
              key={article.id}
              title={article.title}
              id={String(article.id)}
              section="article"
              commentCount={article.comments?.length}
              status={article.status}
              statusOptions={data.statusOptions || undefined}
            />
          ))}
        </AdminList>
      ) : (
        <AdminEmpty
          title="مقاله‌ای یافت نشد"
          action={
            <AdminLinkButton href="/admin/article" size="sm">
              افزودن مقاله
            </AdminLinkButton>
          }
        />
      )}
    </div>
  );
}
