"use client";

import React, { useState } from "react";
import { trpc } from "@/utils/trpc";
import Item from "./Item";
import AdminPageHeader from "../ui/AdminPageHeader";
import AdminLinkButton from "../ui/AdminLinkButton";
import AdminSelect from "../ui/AdminSelect";
import { AdminList } from "../ui/AdminList";
import AdminLoading from "../ui/AdminLoading";
import AdminEmpty from "../ui/AdminEmpty";

export default function Products() {
  const [statusFilter, setStatusFilter] = useState<
    "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined
  >(undefined);
  const { data, isLoading } = trpc.product.shortInfoProducts.useQuery(
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
          <AdminLinkButton href="/admin/product">افزودن محصول</AdminLinkButton>
        }
      />
      {isLoading ? (
        <AdminLoading />
      ) : data?.products?.length ? (
        <AdminList>
          {data.products.map((product) => (
            <Item
              key={product.id}
              title={product.name}
              id={String(product.id)}
              section="product"
              commentCount={product.Comments.length}
              status={product.status}
              statusOptions={data.statusOptions || undefined}
            />
          ))}
        </AdminList>
      ) : (
        <AdminEmpty
          title="محصولی یافت نشد"
          action={
            <AdminLinkButton href="/admin/product" size="sm">
              افزودن محصول
            </AdminLinkButton>
          }
        />
      )}
    </div>
  );
}
