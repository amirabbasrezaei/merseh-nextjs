"use client";

import { trpc } from "@/utils/trpc";
import React, { useEffect, useState } from "react";
import QuillEditor, { contentType } from "./QuillEditor";
import { Plus_Svg } from "@/Components/SVGS";
import Category from "../Category/Category.admin";
import Image from "next/image";
import { EditProductInput } from "@/server/Controllers/product.controller";
import Content from "./ContentViewer";
import AdminPageHeader from "../ui/AdminPageHeader";
import AdminPanel from "../ui/AdminPanel";
import AdminInput from "../ui/AdminInput";
import AdminTextarea from "../ui/AdminTextarea";
import AdminSelect from "../ui/AdminSelect";
import AdminButton from "../ui/AdminButton";
import AdminLinkButton from "../ui/AdminLinkButton";
import type { ManageCategory } from "../Category/ManageCategory";

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
  const [filter, setFilter] = useState<ManageCategory>({});
  const [variations, setVariations] = useState<variation[]>([]);
  const [content, setContent] = useState<contentType[]>([]);
  const [productDetails, setProductDetails] = useState<string[]>([]);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">(
    "DRAFT"
  );
  const [brandId, setBrandId] = useState<number | null>(null);
  const { data: brandsData } = trpc.brand.list.useQuery();
  const { data } = trpc.product.getproduct.useQuery(
    { productId: Number(productId) },
    { enabled: !!productId && !Number.isNaN(Number(productId)) }
  );
  const { mutateAsync: mutateEditProduct } =
    trpc.product.editProduct.useMutation();
  const { mutateAsync: setProductStatus } =
    trpc.product.setProductStatus.useMutation();

  useEffect(() => {
    if (data?.product) {
      setName(data.product.name);
      setEngName(data.product.englishName);
      setPrice(String(data.product.price));
      setContent(data.product.content);
      setProductDetails(data.product.details);
      setStatus(data.product.status || "DRAFT");
      seteditProductImages({
        existingImages: (data.product.imageFileIds || []).map(
          (fileId: string, index: number) => ({
            url: data.product.imageUrls?.[index] || "",
            name: fileId,
          })
        ),
      });
      setMetaDescription(data?.product.metaDescription);
      setFilter({ categoryId: data.product.mainCategoryId });
      setBrandId(data.product.brandId ?? null);
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

  const submitLabel = productId ? "ذخیره تغییرات" : "افزودن محصول";

  return (
    <form
      className="relative flex w-full flex-col gap-5 pb-24"
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
              productVariations: variations.length ? variations : [],
              metaDescription: metaDescription,
              details: productDetails,
              brandId,
            };
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
              metaDescription: metaDescription,
              brandId,
            });
          }
        }
      }}
    >
      <AdminPageHeader
        title={productId ? "ویرایش محصول" : "افزودن محصول"}
        actions={
          <AdminLinkButton href="/admin/products" variant="secondary" size="sm">
            بازگشت به لیست
          </AdminLinkButton>
        }
      />

      <AdminPanel title="اطلاعات پایه">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AdminInput
            label="نام محصول"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />
          <AdminInput
            label="نام انگلیسی محصول"
            value={engName}
            onChange={(e) => setEngName(e.currentTarget.value)}
            dir="ltr"
          />
          <AdminInput
            label="قیمت"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.currentTarget.value)}
            containerClassName="md:col-span-1"
          />
          <AdminSelect
            label="برند"
            value={brandId ?? ""}
            onChange={(e) =>
              setBrandId(e.target.value ? Number(e.target.value) : null)
            }
          >
            <option value="">بدون برند</option>
            {brandsData?.brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
                {brand.isActive ? "" : " (غیرفعال)"}
              </option>
            ))}
          </AdminSelect>
        </div>
      </AdminPanel>

      <AdminPanel title="تصاویر">
        {editProductImages?.existingImages?.length ? (
          <div className="mb-4 flex flex-wrap gap-3">
            {editProductImages.existingImages.map((image, i) => (
              <div
                key={i}
                className="relative h-28 w-28 overflow-hidden rounded-lg border border-gray-200"
              >
                <Image
                  src={image.url}
                  alt={image.name}
                  fill
                  className="object-cover"
                  sizes="112px"
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

      <AdminPanel title="ویژگی‌ها و سئو">
        <div className="flex flex-col gap-4">
          <AdminTextarea
            label="ویژگی محصول"
            value={productDetails.join("\r\n")}
            onChange={(e) => {
              setProductDetails(e.target.value.split(/\r?\n/));
            }}
            rows={4}
            hint="هر خط یک ویژگی"
          />
          <AdminTextarea
            label="توضیحات متا"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            rows={3}
          />
        </div>
      </AdminPanel>

      <AdminPanel
        title="انواع محصول"
        actions={
          <AdminButton
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              setVariations((state: variation[]) => [
                ...state,
                { variationName: "", variations: [{ name: "", price: 0 }] },
              ])
            }
          >
            افزودن ویژگی
            <Plus_Svg classname="w-3.5 h-3.5 fill-current" />
          </AdminButton>
        }
      >
        <div className="flex flex-col gap-4">
          {variations.map((variation, variationIndex) => (
            <div
              key={variationIndex}
              className="rounded-lg border border-gray-100 bg-gray-50/60 p-4"
            >
              <div className="mb-3 max-w-xs">
                <AdminInput
                  label="اسم ویژگی"
                  value={variation.variationName}
                  onChange={(e) =>
                    handleVariationInput(variationIndex, e.target.value)
                  }
                />
              </div>
              <div className="flex flex-col gap-3">
                {variation.variations.map(
                  (variationType, variationTypeIndex) => (
                    <div
                      key={variationTypeIndex}
                      className="flex flex-wrap gap-3 rounded-lg border border-gray-200 bg-white p-3"
                    >
                      <AdminInput
                        label={`نوع ${variationTypeIndex + 1}`}
                        value={variationType.name}
                        onChange={(e) =>
                          handleVariationTypeInput(
                            variationIndex,
                            variationTypeIndex,
                            { name: e.target.value }
                          )
                        }
                        containerClassName="!w-auto min-w-[120px]"
                      />
                      <AdminInput
                        label="قیمت"
                        value={variationType.price}
                        onChange={(e) =>
                          handleVariationTypeInput(
                            variationIndex,
                            variationTypeIndex,
                            { price: Number(e.target.value) }
                          )
                        }
                        containerClassName="!w-auto min-w-[120px]"
                      />
                    </div>
                  )
                )}
                <AdminButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="self-start"
                  onClick={() => addVariationType(variationIndex)}
                >
                  <Plus_Svg classname="w-4 h-4 fill-current" />
                  افزودن نوع
                </AdminButton>
              </div>
            </div>
          ))}
          {!variations.length ? (
            <p className="text-sm text-lightBlack">
              هنوز ویژگی‌ای اضافه نشده است.
            </p>
          ) : null}
        </div>
      </AdminPanel>

      <AdminPanel title="دسته‌بندی">
        <Category filter={filter} setFilter={setFilter} />
      </AdminPanel>

      <AdminPanel title="محتوا">
        <QuillEditor
          setContent={setContent}
          content={content}
          folder="product/content"
        />
        <div className="mt-4">
          <Content contentForView={content} />
        </div>
      </AdminPanel>

      <AdminPanel title="وضعیت انتشار">
        {productId ? (
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
                void setProductStatus({
                  productId: Number(productId),
                  status,
                });
              }}
            >
              ذخیره وضعیت
            </AdminButton>
          </div>
        ) : (
          <p className="text-sm text-lightBlack">
            محصول جدید به‌صورت پیش‌نویس ذخیره می‌شود. پس از ذخیره می‌توانید آن را
            منتشر کنید.
          </p>
        )}
      </AdminPanel>

      <div className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-end gap-3 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur lg:right-64">
        <AdminButton type="submit">{submitLabel}</AdminButton>
      </div>
    </form>
  );
}
