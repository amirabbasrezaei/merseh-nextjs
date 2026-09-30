"use client";

import React, { useEffect, useState } from "react";
import Category from "./Category.admin";
import { filterTypeArgs } from "../AddProduct/ProductEdit";
import QuillEditor, { contentType } from "../AddProduct/QuillEditor";
import { trpc } from "@/utils/trpc";
import AdminPageHeader from "../ui/AdminPageHeader";
import AdminPanel from "../ui/AdminPanel";
import AdminInput from "../ui/AdminInput";
import AdminTextarea from "../ui/AdminTextarea";
import AdminButton from "../ui/AdminButton";
import AdminLinkButton from "../ui/AdminLinkButton";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export interface ManageCategory extends filterTypeArgs {
  name?: string;
  englishName?: string;
  content?: any;
  metaDescription?: string;
}

interface Props {
  categoryId?: string;
}

export default function ManageCategory({ categoryId }: Props) {
  const router = useRouter();
  const isCreateMode = !categoryId;
  const [lastCategoryId, setLastCategoryId] = useState<number>();
  const [filter, setFilter] = useState<ManageCategory>({
    name: "",
    englishName: "",
    metaDescription: "",
    content: [],
  });
  const [saving, setSaving] = useState(false);

  const { mutateAsync: mutateEdit } = trpc.product.editCategory.useMutation();
  const { mutateAsync: mutateCreate } =
    trpc.product.createCategory.useMutation();
  const utils = trpc.useUtils();

  const { data: categoryData } = trpc.product.categoryInfo.useQuery(
    { categoryId: Number(categoryId) },
    { enabled: !!categoryId && !Number.isNaN(Number(categoryId)) }
  );

  useEffect(() => {
    setLastCategoryId(filter.categoryId);
  }, [filter.categoryId]);

  useEffect(() => {
    if (categoryData?.category) {
      setFilter({
        categoryId: Number(categoryId),
        content: JSON.parse(categoryData.category.content || "[]"),
        name: categoryData.category.title,
        metaDescription: categoryData.category.metaDescription,
        englishName: categoryData.category.englishTitle,
        parentCategories: categoryData.category.parent_categories,
      });
    }
  }, [categoryData, categoryId]);

  const handleSave = async () => {
    const name = filter.name?.trim();
    if (!name) {
      toast.error("نام دسته‌بندی را وارد کنید");
      return;
    }

    setSaving(true);
    try {
      if (isCreateMode && !filter.categoryId) {
        const created = await mutateCreate({
          title: name,
          parentId: null,
        });
        await mutateEdit({
          categoryId: created.id,
          content: JSON.stringify(filter.content || []),
          englishName: filter.englishName || "",
          name,
          metaDescription: filter.metaDescription || "",
        });
        toast.success("دسته‌بندی ایجاد شد");
        await utils.product.flatCategories.invalidate();
        await utils.product.categories.invalidate();
        router.push(`/admin/category/${created.id}`);
        return;
      }

      if (!filter.categoryId) {
        toast.error("یک دسته‌بندی را انتخاب کنید یا نام دسته ریشه را وارد کنید");
        return;
      }

      await mutateEdit({
        categoryId: filter.categoryId,
        content: JSON.stringify(filter.content || []),
        englishName: filter.englishName || "",
        name,
        metaDescription: filter.metaDescription || "",
      });
      toast.success("تغییرات ذخیره شد");
      await utils.product.flatCategories.invalidate();
      await utils.product.categories.invalidate();
    } catch (err: any) {
      toast.error(err?.message || "ذخیره ناموفق بود");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative flex w-full flex-col gap-5 pb-24">
      <AdminPageHeader
        title={categoryId ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی"}
        actions={
          <AdminLinkButton
            href="/admin/categories"
            variant="secondary"
            size="sm"
          >
            بازگشت به لیست
          </AdminLinkButton>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr]">
        <AdminPanel title="انتخاب دسته">
          <Category filter={filter} setFilter={setFilter} />
        </AdminPanel>

        <div className="flex flex-col gap-5">
          <AdminPanel title="اطلاعات پایه">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <AdminInput
                label="نام"
                value={filter.name}
                onChange={(e) => {
                  setFilter((state) => ({
                    ...state,
                    name: e.target.value,
                  }));
                }}
              />
              <AdminInput
                label="نام انگلیسی"
                value={filter.englishName}
                onChange={(e) => {
                  setFilter((state) => ({
                    ...state,
                    englishName: e.target.value,
                  }));
                }}
                dir="ltr"
              />
            </div>
            {isCreateMode && !filter.categoryId ? (
              <p className="mt-3 text-base text-lightBlack">
                با ذخیره، یک دسته ریشه جدید ساخته می‌شود. اگر می‌خواهید زیرمجموعه
                بسازید، از دکمه + کنار یک دسته موجود استفاده کنید.
              </p>
            ) : null}
          </AdminPanel>

          <AdminPanel title="سئو">
            <AdminTextarea
              label="توضیحات متا"
              value={filter.metaDescription}
              onChange={(e) => {
                setFilter((state) => ({
                  ...state,
                  metaDescription: e.target.value,
                }));
              }}
              rows={3}
            />
          </AdminPanel>

          <AdminPanel title="محتوا">
            <QuillEditor
              initialFlag={filter.categoryId !== lastCategoryId ? false : true}
              content={filter.content}
              setContent={(next: contentType[]) =>
                setFilter((lastState) => ({
                  ...lastState,
                  content: next,
                }))
              }
            />
          </AdminPanel>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-end gap-3 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur lg:right-64">
        <AdminButton
          disabled={saving || !filter.name?.trim()}
          onClick={() => void handleSave()}
        >
          {saving
            ? "در حال ذخیره…"
            : isCreateMode && !filter.categoryId
              ? "ایجاد دسته‌بندی"
              : "ثبت تغییرات"}
        </AdminButton>
      </div>
    </div>
  );
}
