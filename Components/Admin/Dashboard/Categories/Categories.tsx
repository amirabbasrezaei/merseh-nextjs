"use client";

import { trpc } from "@/utils/trpc";
import Item from "./Item.categories";
import AdminPageHeader from "../../ui/AdminPageHeader";
import AdminLinkButton from "../../ui/AdminLinkButton";
import { AdminList } from "../../ui/AdminList";
import AdminLoading from "../../ui/AdminLoading";
import AdminEmpty from "../../ui/AdminEmpty";
import AdminInput from "../../ui/AdminInput";
import AdminButton from "../../ui/AdminButton";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function Categories() {
  const router = useRouter();
  const [rootTitle, setRootTitle] = useState("");
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.product.flatCategories.useQuery();
  const createMutation = trpc.product.createCategory.useMutation({
    onSuccess: (created) => {
      toast.success("دسته‌بندی ایجاد شد");
      setRootTitle("");
      utils.product.flatCategories.invalidate();
      utils.product.categories.invalidate();
      if (created?.id) {
        router.push(`/admin/category/${created.id}`);
      }
    },
    onError: (err) => toast.error(err.message || "ایجاد دسته ناموفق بود"),
  });

  return (
    <div className="flex flex-col">
      <AdminPageHeader
        actions={
          <AdminLinkButton href="/admin/category">
            افزودن دسته‌بندی
          </AdminLinkButton>
        }
      />
      {isLoading ? (
        <AdminLoading />
      ) : data?.categories?.length ? (
        <AdminList>
          {data.categories.map((category) => (
            <Item
              key={category.id}
              title={category.title}
              id={String(category.id)}
              imageUrl={category.imageUrl}
              currentStatus={category.status}
              selectOptions={data.statusOptions}
            />
          ))}
        </AdminList>
      ) : (
        <AdminEmpty
          title="دسته‌بندی‌ای یافت نشد"
          description="اولین دسته ریشه را اینجا بسازید."
          action={
            <div className="flex w-full max-w-sm flex-col gap-3">
              <AdminInput
                label="نام دسته ریشه"
                value={rootTitle}
                onChange={(e) => setRootTitle(e.target.value)}
                placeholder="مثلاً روغن‌ها"
              />
              <AdminButton
                disabled={!rootTitle.trim() || createMutation.isPending}
                onClick={() =>
                  createMutation.mutate({
                    title: rootTitle.trim(),
                    parentId: null,
                  })
                }
              >
                {createMutation.isPending
                  ? "در حال ایجاد…"
                  : "ایجاد دسته ریشه"}
              </AdminButton>
            </div>
          }
        />
      )}
    </div>
  );
}
