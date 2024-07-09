"use client";

import { trpc } from "@/utils/trpc";
import React, { createElement, useEffect, useState } from "react";
import "react-quill/dist/quill.snow.css";
import QuillEditor, { contentType } from "./QuillEditor";
import { Plus_Svg } from "@/Components/SVGS";
import Category from "../Category/Category.admin";
import ContentViewer from "./ContentViewer";
import Image from "next/image";
import { EditProductInput } from "@/server/Controllers/product.controller";
import TextArea from "@/Components/TextArea";

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

export default function ProductEdit({ productId }: Props) {
  const [metaDescription, setMetaDescription] = useState("");
  const { mutateAsync } = trpc.product.addProduct.useMutation({});
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
  const [productDetails, setProductDetails] = useState<string[]>([]);
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
      setProductDetails(data.product.details);
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

  console.log(productDetails);

  return (
    <form
      className="w-full max-w-[1400px] flex flex-col gap-10 px-20 overflow-y-scroll py-10 h-full"
      onSubmit={(e) => {
        e.preventDefault();
        if (filter.categoryId) {
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
              details: productDetails,
            };
            console.log(editProductBody);
            mutateEditProduct(editProductBody);
          } else {
            mutateAsync({
              images: images,
              name: name,
              englishName: engName,
              price: price,
              categoryId: String(filter.categoryId),
              parentCategories: filter.parentCategories,
              productVariations: variations.length ? variations : [],
              productContent: content,
              details: productDetails,
            }).then((res) => console.log(res));
          }
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
            نام محصول
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
            نام انگلیسی محصول
          </label>
          <input
            value={engName}
            onChange={(e) => setEngName(e.currentTarget.value)}
            className="appearance-none block w-full bg-gray-200 text-gray-700 border  rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
            id="grid-first-name"
            type="text"
          />
        </div>
        <div className="w-full md:w-1/2 px-3">
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="grid-last-name"
          >
            قیمت
          </label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="grid-price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.currentTarget.value)}
          />
        </div>
      </div>
      <label>ویژگی محصول</label>
      <textarea
        value={productDetails.join("\r\n")}
        onChange={(e) => {
          setProductDetails(e.target.value.split(/\r?\n/));
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
      <div className="flex flex-col gap-4 justify-center  w-full">
        <h3 className="text-lg ">انواع محصول</h3>
        {variations.map((variation, variationIndex) => (
          <div
            key={variationIndex}
            className="flex flex-row justify-center  gap-4"
          >
            <div className="flex flex-col gap-1 h-full">
              <label
                htmlFor="variation_name"
                className="text-black1 text-[14px] font-[500] mr-3"
              >
                اسم ویژگی
              </label>
              <div className="flex flex-row items-center">
                <input
                  value={variation.variationName}
                  onChange={(e) =>
                    handleVariationInput(variationIndex, e.target.value)
                  }
                  id="variation_name"
                  type="text"
                  className="border ml-3 border-gray-100 h-10 w-[200px] rounded-[13px]"
                />
                <span className="text-[20px] text-gray-600">:</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="flex flex-col gap-5">
                {variation.variations.map(
                  (variationType, variationTypeIndex) => (
                    <div
                      key={variationTypeIndex}
                      className="flex flex-row gap-3 bg-gray-50 rounded-[13px] p-3"
                    >
                      <div className="flex flex-col gap-1">
                        <label className="text-black1 text-[14px] font-[500] mr-3">
                          نوع {variationTypeIndex + 1}
                        </label>
                        <input
                          value={variationType.name}
                          onChange={(e) =>
                            handleVariationTypeInput(
                              variationIndex,
                              variationTypeIndex,
                              { name: e.target.value }
                            )
                          }
                          type="text"
                          className="border border-gray-100 h-10 w-[100px] rounded-[13px]"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-black1 text-[14px] font-[500] mr-3">
                          قیمت
                        </label>
                        <input
                          onChange={(e) =>
                            handleVariationTypeInput(
                              variationIndex,
                              variationTypeIndex,
                              { price: Number(e.target.value) }
                            )
                          }
                          value={variationType.price}
                          type="text"
                          className="border border-gray-100 h-10 w-[100px] rounded-[13px]"
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
              <div
                onClick={() => addVariationType(variationIndex)}
                className="bg-gray-50 h-[40px]  w-[40px] flex items-center justify-center rounded-[14px] p-[9px]"
              >
                <Plus_Svg classname="w-[20px] h-auto fill-gray-800" />
              </div>
            </div>
          </div>
        ))}

        <div
          onClick={() =>
            setVariations((state: variation[]) => [
              ...state,
              { variationName: "", variations: [{ name: "", price: 0 }] },
            ])
          }
          className="bg-gray-100 cursor-pointer h-10 w-[200px] gap-1 rounded-[13px] justify-center flex items-center"
        >
          <span>افزودن ویژگی</span>
          <Plus_Svg classname="w-4 h-4 fill-green2" />
        </div>
      </div>

      <Category filter={filter} setFilter={setFilter} />

      <QuillEditor setContent={setContent} content={content} />
      <ContentViewer contentForView={content} />
      <button className="bg-green2 h-10 text-white w-[300px] rounded-[13px]">
        افزودن محصول
      </button>
    </form>
  );
}
