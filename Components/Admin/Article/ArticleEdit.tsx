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

type Props = {
  productId?: string;
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

export default function ArticleEdit({ productId }: Props) {
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
  const [articleDetails, setArticleDetails] = useState<string[]>([]);
  const { data } = trpc.product.getproduct.useQuery({
    productId: Number(productId),
  });
  const { mutateAsync: mutateEditProduct } =
    trpc.product.editProduct.useMutation();

  useEffect(() => {
    if (data?.product) {
      setName(data.product.name);
      setEngName(data.product.englishName);
      setPrice(String(data.product.price));
      setContent(data.product.content);
      setArticleDetails(data.product.details);
      seteditProductImages({
        existingImages: data.product.imageUrls.map((img: any) => ({
          url: img,
          name: img.split("/").at(-1) || "",
        })),
      });
      setMetaDescription(data?.product.metaDescription);
      setFilter({ categoryId: data.product.mainCategoryId });
    }
  }, [data]);

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
              if (productId) {
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

  const handleVariationInput = (
    variationIndex: number,
    variationName: string
  ) => {
    let copy = [...variations];
    copy[variationIndex].variationName = variationName;
    setVariations(copy);
  };

  const handleVariationTypeInput = (
    variationIndex: number,
    variationTypeIndex: number,
    input: { price?: number; name?: string }
  ) => {
    const { name, price } = input;
    let copy = [...variations];

    copy[variationIndex].variations[variationTypeIndex] = {
      name: name
        ? name
        : copy[variationIndex].variations[variationTypeIndex].name,
      price: price
        ? price
        : copy[variationIndex].variations[variationTypeIndex].price,
    };

    setVariations(copy);
  };

  const addVariationType = (variationIndex: number) => {
    variations[variationIndex].variations.push({
      name: "",
      price: 0,
    });
    setVariations((state) => [...state]);
  };

  return (
    <form
      className="w-full max-w-[1400px] flex flex-col gap-10 px-20 overflow-y-scroll py-10 h-full"
      onSubmit={(e) => {
        e.preventDefault();

          if (productId) {
            const convertProductImage = {
              existingImages: editProductImages?.existingImages.map(
                (e) => e.name
              ) || [""],
              newImages: editProductImages?.newImages || [],
            };
            const editProductBody: EditProductInput = {
              images: convertProductImage,
              productId: productId,
              categoryId: String(filter.categoryId),
              englishName: engName,
              name,
              price,
              productContent: content,
              parentCategories: filter.parentCategories,
              productVariations: variations.length ? variations : [],
              metaDescription: metaDescription,
              details: articleDetails,
            };
            console.log(editProductBody);
            mutateEditProduct(editProductBody);
          } else {
            mutateCreateArticle({
              content,
              description: articleDetails,

              images,
              title: name,
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
      <label>ویژگی مقاله</label>
      <textarea
        value={articleDetails.join("\r\n")}
        onChange={(e) => {
          setArticleDetails(e.target.value.split(/\r?\n/));
        }}
        className="bg-gray-50 appearance-none outline-none p-4"
      />
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
