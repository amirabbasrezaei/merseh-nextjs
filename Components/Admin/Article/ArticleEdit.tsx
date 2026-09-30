"use client";

import { trpc } from "@/utils/trpc";
import React, { useEffect, useState } from "react";
import QuillEditor, { contentType } from "../AddProduct/QuillEditor";
import Image from "next/image";
import { EditArticleInput } from "@/server/Controllers/article.controller";
import AdminPageHeader from "../ui/AdminPageHeader";
import AdminPanel from "../ui/AdminPanel";
import AdminInput from "../ui/AdminInput";
import AdminTextarea from "../ui/AdminTextarea";
import AdminSelect from "../ui/AdminSelect";
import AdminButton from "../ui/AdminButton";
import AdminLinkButton from "../ui/AdminLinkButton";

type Props = {
  articleId?: string;
};

type imageType = { base64: string; name: string };

type editImageType = {
  existingImages: { url: string; name: string }[];
  newImages?: { base64: string; name: string }[];
};

export interface filterTypeArgs {
  categoryId?: number;
  searchTerm?: string;
  parentCategories?: number[];
}

export default function ArticleEdit({ articleId }: Props) {
  const [metaDescription, setMetaDescription] = useState("");
  const { mutate: mutateCreateArticle } =
    trpc.article.createArticle.useMutation();
  const [images, setImages] = useState<imageType[]>([]);
  const [editProductImages, seteditProductImages] =
    useState<editImageType | null>(null);
  const [engName, setEngName] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [files, setFiles] = useState();
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [flag, setFlag] = useState(false);
  const [content, setContent] = useState<contentType[]>([]);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">(
    "DRAFT"
  );

  const { data: articleData } = trpc.article.getArticleAdmin.useQuery(
    { articleId: Number(articleId) },
    { enabled: !!articleId && !Number.isNaN(Number(articleId)) }
  );
  const { mutateAsync: mutateEditArticle } =
    trpc.article.editArticle.useMutation();
  const { mutateAsync: setArticleStatus } =
    trpc.article.setArticleStatus.useMutation();

  useEffect(() => {
    if (articleData?.article) {
      setName(articleData.article.title);
      setContent(articleData.article.content);
      setEngName(articleData.article.englishTitle);
      setStatus(articleData.article.status || "DRAFT");
      seteditProductImages({
        existingImages: articleData.article.imageUrls.map((img: any) => ({
          url: img,
          name: img.split("/").at(-1) || "",
        })),
      });
      setMetaDescription(articleData.article.metaDescription || "");
    }
  }, [articleData]);

  useEffect(() => {
    if ((files as any)?.length && !flag) {
      setFlag(true);
      setFiles(Array.prototype.slice.call(files) as any);
    }
  }, [files]);

  useEffect(() => {
    const reader = new FileReader();
    if (
      (files as any)?.length &&
      currentImageIndex < (files as any)?.length &&
      flag
    ) {
      (async () => {
        if ((files as any)[currentImageIndex] !== undefined) {
          const chooseImage = (files as any)[currentImageIndex];
          reader.onloadend = (res) => {
            const promise = new Promise((resolved) => {
              if (articleId) {
                seteditProductImages((state) => ({
                  ...state,
                  newImages: state?.newImages?.length
                    ? [
                        ...state?.newImages,
                        {
                          base64: (res.target?.result as string)
                            .replace("data:", "")
                            .replace(/^.+,/, ""),
                          name: chooseImage.name,
                        },
                      ]
                    : [
                        {
                          base64: (res.target?.result as string)
                            .replace("data:", "")
                            .replace(/^.+,/, ""),
                          name: chooseImage.name,
                        },
                      ],
                  existingImages: state?.existingImages || [],
                }));
              } else {
                setImages((state: imageType[]) => [
                  ...state,
                  {
                    base64: (res.target?.result as string)
                      .replace("data:", "")
                      .replace(/^.+,/, ""),
                    name: chooseImage.name,
                  },
                ]);
              }
              resolved({ nextIndex: currentImageIndex + 1, status: true });
            });

            promise.then(({ nextIndex, status }: any) => {
              if (status === true) {
                setCurrentImageIndex(nextIndex as number);
              }
            });
          };
          await reader.readAsDataURL(chooseImage);
        }
      })();
    }
  }, [currentImageIndex, files]);

  const submitLabel = articleId ? "ذخیره تغییرات" : "افزودن مقاله";

  return (
    <form
      className="relative flex w-full flex-col gap-5 pb-24"
      onSubmit={(e) => {
        e.preventDefault();

        if (articleId) {
          const convertProductImage = {
            existingImages: editProductImages?.existingImages.map(
              (e) => e.name
            ) || [""],
            newImages: editProductImages?.newImages || [],
          };
          const editProductBody: EditArticleInput = {
            images: convertProductImage.newImages,
            articleId: Number(articleId),
            englishTitle: engName,
            title: name,
            content,
            metaDescription: metaDescription,
          };
          mutateEditArticle(editProductBody);
        } else {
          mutateCreateArticle({
            content,
            metaDescription: metaDescription,
            images,
            title: name,
            englishTitle: engName,
          });
        }
      }}
    >
      <AdminPageHeader
        title={articleId ? "ویرایش مقاله" : "افزودن مقاله"}
        actions={
          <AdminLinkButton href="/admin/articles" variant="secondary" size="sm">
            بازگشت به لیست
          </AdminLinkButton>
        }
      />

      <AdminPanel title="اطلاعات پایه">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AdminInput
            label="نام مقاله"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />
          <AdminInput
            label="نام انگلیسی مقاله"
            value={engName}
            onChange={(e) => setEngName(e.currentTarget.value)}
            dir="ltr"
          />
        </div>
      </AdminPanel>

      <AdminPanel title="تصویر شاخص">
        {editProductImages?.existingImages?.length ? (
          <div className="mb-4 flex flex-wrap gap-3">
            {editProductImages.existingImages.map((image, i) => (
              <div
                key={i}
                className="relative h-36 w-36 overflow-hidden rounded-lg border border-gray-200"
              >
                <Image
                  src={image.url}
                  alt={image.name}
                  fill
                  className="object-cover"
                  sizes="144px"
                />
              </div>
            ))}
          </div>
        ) : null}
        <input
          onChange={(e) => {
            setCurrentImageIndex(0);
            setImages([]);
            setFlag(false);
            setFiles((e.target as any).files);
          }}
          multiple
          type="file"
          accept="image/*"
          className="text-sm text-gray-600 file:ml-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700"
        />
      </AdminPanel>

      <AdminPanel title="سئو">
        <AdminTextarea
          label="توضیحات متا"
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          rows={3}
        />
      </AdminPanel>

      <AdminPanel title="محتوا">
        <QuillEditor
          setContent={setContent}
          content={content}
          folder="article/content"
        />
      </AdminPanel>

      <AdminPanel title="وضعیت انتشار">
        {articleId ? (
          <div className="flex flex-wrap items-end gap-3">
            <AdminSelect
              label="وضعیت"
              className="!w-auto min-w-[160px]"
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value as "DRAFT" | "PUBLISHED" | "ARCHIVED"
                )
              }
            >
              <option value="DRAFT">پیش‌نویس</option>
              <option value="PUBLISHED">منتشر شده</option>
              <option value="ARCHIVED">آرشیو</option>
            </AdminSelect>
            <AdminButton
              type="button"
              variant="secondary"
              onClick={() => {
                void setArticleStatus({
                  articleId: Number(articleId),
                  status,
                });
              }}
            >
              ذخیره وضعیت
            </AdminButton>
          </div>
        ) : (
          <p className="text-sm text-lightBlack">
            مقاله جدید به‌صورت پیش‌نویس ذخیره می‌شود.
          </p>
        )}
      </AdminPanel>

      <div className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-end gap-3 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur lg:right-64">
        <AdminButton type="submit">{submitLabel}</AdminButton>
      </div>
    </form>
  );
}
