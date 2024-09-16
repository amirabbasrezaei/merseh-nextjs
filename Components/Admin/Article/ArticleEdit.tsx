"use client";

import { trpc } from "@/utils/trpc";
import React, { createElement, useEffect, useState } from "react";
import "react-quill/dist/quill.snow.css";
import QuillEditor, { contentType } from "../AddProduct/QuillEditor";
import { Plus_Svg } from "@/Components/SVGS";
import Category from "../Category/Category.admin";
import ContentViewer from "../AddProduct/ContentViewer";
import Image from "next/image";
import { EditProductInput } from "@/server/Controllers/product.controller";
import { EditArticleInput } from "@/server/Controllers/article.controller";

type Props = {
  articleId?: string;
};

type imageType = { base64: string; name: string };

type editImageType = {
  existingImages: { url: string; name: string }[];
  newImages?: { base64: string; name: string }[];
};

type variation = {
  variationName: string;
  variations: { name: string; price: number }[];
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
  const [price, setPrice] = useState<string>("");
  const [files, setFiles] = useState();
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [flag, setFlag] = useState(false);
  const [filter, setFilter] = useState<filterTypeArgs>({});
  const [variations, setVariations] = useState<variation[]>([]);
  const [content, setContent] = useState<contentType[]>([]);

  const { data: articleData } = trpc.article.getArticle.useQuery({
    articleId: Number(articleId),
  });
  const { mutateAsync: mutateEditArticle } =
    trpc.article.editArticle.useMutation();

  useEffect(() => {
    if (articleData?.article) {
      setName(articleData.article.title);
      setContent(articleData.article.content);
      seteditProductImages({
        existingImages: articleData.article.imageUrls.map((img: any) => ({
          url: img,
          name: img.split("/").at(-1) || "",
        })),
      });
      setMetaDescription(articleData.article.metaDescription || "");
      // setFilter({ categoryId: data.product.mainCategoryId });
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
              console.log("hi");
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

  return (
    <form
      className="w-full max-w-[1400px] flex flex-col gap-10 px-20 overflow-y-scroll py-10 h-full"
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
      <div>
        {editProductImages?.existingImages.map((image, i) => (
          <Image
            key={i}
            src={image.url}
            alt={image.name}
            width={200}
            height={200}
          />
        ))}
      </div>
      <div>
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
        />
      </div>
      <div className="flex flex-wrap -mx-3 mb-6">
        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="grid-first-name"
          >
            نام مقاله
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            className="appearance-none block w-full bg-gray-200 text-gray-700 border  rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
            id="grid-first-name"
            type="text"
          />
        </div>
        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="grid-first-name"
          >
            نام انگلیسی مقاله
          </label>
          <input
            value={engName}
            onChange={(e) => setEngName(e.currentTarget.value)}
            className="appearance-none block w-full bg-gray-200 text-gray-700 border  rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
            id="grid-first-name"
            type="text"
          />
        </div>
      </div>
      <label>توضیحات متا</label>
      <textarea
        value={metaDescription}
        onChange={(e) => {
          setMetaDescription(e.target.value);
        }}
        className="bg-gray-50 appearance-none outline-none p-4"
      />

      <Category filter={filter} setFilter={setFilter} />

      <QuillEditor setContent={setContent} content={content} />
      <ContentViewer contentForView={content} />
      <button className="bg-green2 h-10 text-white w-[300px] rounded-[13px]">
        افزودن
      </button>
    </form>
  );
}
