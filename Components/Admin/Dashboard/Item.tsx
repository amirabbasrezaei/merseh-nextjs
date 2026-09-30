"use client";

import { Comment_SVG, Edit_Svg } from "@/Components/SVGS";
import Link from "next/link";
import React from "react";
import { trpc } from "@/utils/trpc";
import toast from "react-hot-toast";
import { AdminListRow } from "../ui/AdminList";
import AdminBadge, { statusTone } from "../ui/AdminBadge";
import AdminButton from "../ui/AdminButton";
import AdminSelect from "../ui/AdminSelect";

interface Props {
  title: string;
  id: string;
  section: "product" | "article" | "users";
  commentCount?: number;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  statusOptions?: { value: string; title: string }[];
}

const statusLabel: Record<string, string> = {
  DRAFT: "پیش‌نویس",
  PUBLISHED: "منتشر شده",
  ARCHIVED: "آرشیو",
};

export default function Item({
  title,
  id,
  section,
  commentCount,
  status,
  statusOptions,
}: Props) {
  const utils = trpc.useUtils();

  const setProductStatus = trpc.product.setProductStatus.useMutation({
    onSuccess: () => {
      toast.success("وضعیت محصول به‌روز شد");
      utils.product.shortInfoProducts.invalidate();
    },
  });
  const deleteProduct = trpc.product.deleteProduct.useMutation({
    onSuccess: () => {
      toast.success("محصول حذف شد");
      utils.product.shortInfoProducts.invalidate();
    },
    onError: (err) => toast.error(err.message || "حذف محصول ناموفق بود"),
  });
  const setArticleStatus = trpc.article.setArticleStatus.useMutation({
    onSuccess: () => {
      toast.success("وضعیت مقاله به‌روز شد");
      utils.article.adminList.invalidate();
    },
  });
  const deleteArticle = trpc.article.deleteArticle.useMutation({
    onSuccess: () => {
      toast.success("مقاله حذف شد");
      utils.article.adminList.invalidate();
    },
    onError: (err) => toast.error(err.message || "حذف مقاله ناموفق بود"),
  });

  const options =
    statusOptions ||
    Object.entries(statusLabel).map(([value, title]) => ({ value, title }));

  return (
    <AdminListRow>
      <div className="flex min-w-0 flex-row items-center gap-3">
        <Link
          href={`/${section === "article" ? "mag" : section}/${id}`}
          className="truncate text-base font-medium text-black1 hover:text-green2"
        >
          {title}
        </Link>
        {status ? (
          <AdminBadge tone={statusTone(status)}>
            {statusLabel[status] || status}
          </AdminBadge>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-row flex-wrap items-center gap-2">
        {status ? (
          <AdminSelect
            className="!w-auto min-w-[120px] py-1.5"
            value={status}
            onChange={(e) => {
              const next = e.target.value as
                | "DRAFT"
                | "PUBLISHED"
                | "ARCHIVED";
              if (section === "product") {
                setProductStatus.mutate({
                  productId: Number(id),
                  status: next,
                });
              } else if (section === "article") {
                setArticleStatus.mutate({
                  articleId: Number(id),
                  status: next,
                });
              }
            }}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.title}
              </option>
            ))}
          </AdminSelect>
        ) : null}
        {commentCount ? (
          <span className="inline-flex items-center gap-1 text-sm text-lightBlack">
            {commentCount}
            <Comment_SVG classname="h-4 w-4 fill-current" />
          </span>
        ) : null}
        {section !== "users" ? (
          <Link
            href={`/admin/${section}/${id}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            title="ویرایش"
          >
            <Edit_Svg classname="w-4" />
          </Link>
        ) : null}
        {section === "product" || section === "article" ? (
          <AdminButton
            variant="danger"
            size="sm"
            onClick={() => {
              if (
                !confirm(
                  "آیا از حذف قطعی مطمئن هستید؟ این عمل قابل بازگشت نیست."
                )
              ) {
                return;
              }
              if (section === "product") {
                deleteProduct.mutate({ productId: Number(id) });
              } else {
                deleteArticle.mutate({ articleId: Number(id) });
              }
            }}
          >
            حذف
          </AdminButton>
        ) : null}
      </div>
    </AdminListRow>
  );
}
