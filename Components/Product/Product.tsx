"use client";

import React, { useEffect, useRef, useState } from "react";
import { trpc } from "@/utils/trpc";
import classNames from "classnames";
import ProductImages from "./ProductImages";
import ProductSpecs, { parseDetails } from "./ProductSpecs";
import ProductBuyPanel from "./ProductBuyPanel";
import { motion } from "framer-motion";
import ProductCarousel from "../Home/ProductCarousel/ProductCarousel";
import Image from "next/image";
import { toPathSlug } from "@/utils/slug";
import useShoppingCart, { ShoppingCart } from "../useShoppingCart";
import toast from "react-hot-toast";
import useWindowSize from "../useWindowSize";
import { useRouter, useSearchParams } from "next/navigation";
import { Check } from "../SVGS";
import Link from "next/link";
import Content from "../Admin/AddProduct/ContentViewer";
import type { contentType } from "../Admin/AddProduct/QuillEditor";
import Comments from "./Comments";

type Props = {
  productId: string;
  productData: { product?: ProductRecord | null } | null;
};

type VariationValue = {
  id: number;
  name: string;
  price: number;
  discount: number;
  instock: boolean;
};

type VariationGroup = {
  id: number;
  variationName: string;
  variations: VariationValue[];
};

type ProductCategory = {
  id: number;
  title: string;
};

type ProductRecord = {
  id: number;
  name: string;
  englishName?: string;
  price: number;
  discount: number;
  instock: boolean;
  metaDescription?: string;
  details?: string[];
  imageUrls?: string[];
  content?: contentType[];
  mainCategoryId?: number;
  category?: ProductCategory[];
  variations?: VariationGroup[];
  brand?: {
    id: number;
    name: string;
    isActive: boolean;
    logoUrl: string | null;
  } | null;
};

type ProductVariation = {
  price: number;
  discount: number;
  variationValueid: number;
  variationId: number;
} | null;

function readVariation(
  product: ProductRecord | null | undefined,
  variationParam: string | null,
  valueParam: string | null
): ProductVariation {
  const groups = product?.variations;
  if (!groups?.length) return null;

  const requestedGroupId = Number(variationParam) || groups[0].id;
  const group = groups.find((item) => item.id === requestedGroupId) ?? groups[0];
  const requestedValueId = Number(valueParam) || group.variations[0]?.id;
  const value =
    group.variations.find((item) => item.id === requestedValueId) ??
    group.variations[0];
  if (!value) return null;

  return {
    variationId: group.id,
    variationValueid: value.id,
    price: value.price,
    discount: value.discount,
  };
}

function selectedValue(
  product: ProductRecord | null | undefined,
  selected: ProductVariation
) {
  if (!product || !selected) return null;
  const group = product.variations?.find((item) => item.id === selected.variationId);
  return group?.variations.find((item) => item.id === selected.variationValueid) ?? null;
}

function mainCategory(product: ProductRecord) {
  const categories = product.category ?? [];
  if (!categories.length) return null;
  return (
    categories.find((item) => item.id === product.mainCategoryId) ?? categories[0]
  );
}

function hasArticle(content: contentType[] | undefined) {
  if (!content?.length) return false;

  const walk = (node: contentType | null | undefined): boolean => {
    if (!node || typeof node !== "object") return false;
    if (node.type === "img") return true;
    if (
      node.type !== "a" &&
      typeof node.content === "string" &&
      node.content.trim().length > 0
    ) {
      return true;
    }
    const children = Array.isArray(node.childs) ? node.childs : [];
    return children.some(walk);
  };

  return content.some(walk);
}

export default function Product({ productId, productData }: Props) {
  const product = productData?.product;
  const commentsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const specsRef = useRef<HTMLDivElement>(null);
  const { width } = useWindowSize();
  const params = useSearchParams();
  const router = useRouter();
  const [productInShoppingCart, setProductInShoppingCart] = useState<
    ShoppingCart["orderitems"][0] | null
  >(null);
  const {
    addProduct,
    getProduct,
    incrementProductNumber,
    items,
    decrementProductNumber,
    removeProductFromOrder,
  } = useShoppingCart();

  const categoryId = product?.mainCategoryId;
  const { data: related } = trpc.product.related.useQuery(
    { productId: Number(productId), categoryId: categoryId || 0 },
    { enabled: typeof categoryId === "number" }
  );

  const [selectedProductVariation, setSelectedProductVariation] =
    useState<ProductVariation>(() =>
      readVariation(
        product,
        params.get("variation"),
        params.get("variationValue")
      )
    );
  const [visibleSection, setVisibleSection] = useState("");

  useEffect(() => {
    setSelectedProductVariation(
      readVariation(product, params.get("variation"), params.get("variationValue"))
    );
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;
    const selectedProduct = getProduct(
      product.id,
      selectedProductVariation?.variationValueid
    );
    setProductInShoppingCart(selectedProduct ? selectedProduct : null);
  }, [selectedProductVariation, items, product]);

  const specRows = parseDetails(product?.details ?? []);
  const showFullSpecs = specRows.length > 4;
  const showArticle = hasArticle(product?.content);
  const category = product ? mainCategory(product) : null;
  const activeValue = selectedValue(product, selectedProductVariation);
  const unitPrice = activeValue?.price ?? product?.price ?? 0;
  const unitDiscount = activeValue?.discount ?? product?.discount ?? 0;
  const inStock = activeValue ? activeValue.instock : Boolean(product?.instock);
  const quantityInCart =
    productInShoppingCart && productInShoppingCart.numberOfProduct > 0
      ? productInShoppingCart.numberOfProduct
      : null;

  useEffect(() => {
    const handleScroll = () => {
      const line = 96;
      const sections = [
        { id: "article", el: contentRef.current },
        { id: "specs", el: specsRef.current },
        { id: "comments", el: commentsRef.current },
      ];
      let current = sections.find((section) => section.el)?.id ?? "";
      for (const section of sections) {
        if (!section.el) continue;
        if (section.el.getBoundingClientRect().top <= line) current = section.id;
      }
      if (current) setVisibleSection(current);
    };

    const main = document.querySelector("main");
    main?.addEventListener("scroll", handleScroll);
    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      main?.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [showArticle, showFullSpecs]);

  const notifyAdded = (productName: string) => {
    toast.custom(
      (t: { visible: boolean }) =>
        t.visible ? (
          <motion.div
            transition={{ duration: 0.3 }}
            initial={
              width > 640
                ? { scale: 0.6, translateX: 100, opacity: 0 }
                : { scale: 0.6, translateY: -100, opacity: 0 }
            }
            animate={
              width > 640
                ? { scale: 1, translateX: 0, opacity: 1 }
                : { scale: 1, translateY: 0, opacity: 1 }
            }
            exit={
              width > 640
                ? { scale: 0.6, translateX: 100, opacity: 0 }
                : { scale: 0.6, translateY: -100, opacity: 0 }
            }
            className="flex h-[60px] w-fit origin-top flex-row items-center justify-center gap-5 rounded-[12px] bg-white px-3 shadow-md sm:origin-right"
          >
            <span className="text-[12px] text-lightBlack sm:text-[15px]">
              {`${productName} به سبد خرید اضافه شد`}
            </span>
            <span
              onClick={() => {
                toast.dismiss();
                router.push("/cart/checkout");
              }}
              className="cursor-pointer text-[12px] font-normal text-green1 sm:text-[15px]"
            >
              مشاهده سبد خرید
            </span>
            <div
              className="cursor-pointer rounded-[10px] bg-gray-100 p-2"
              onClick={() => toast.dismiss()}
            >
              <Check classname="h-auto w-5 fill-black1" />
            </div>
          </motion.div>
        ) : null,
      {
        position: width > 640 ? "top-left" : "top-center",
        duration: 6000,
      }
    );
  };

  const addCurrentProduct = () => {
    if (!product || !inStock) return;
    addProduct(
      product.name,
      unitPrice,
      product.id,
      selectedProductVariation?.variationId,
      selectedProductVariation?.variationValueid
    ).then(() => notifyAdded(product.name));
  };

  const sectionClass = (id: string) =>
    classNames(
      "-mb-px border-b-2 pb-2 text-[16px] font-medium",
      visibleSection === id
        ? "border-green2 text-green1"
        : "border-transparent text-lightBlack"
    );

  return (
    <section id="productSection" className="flex w-full flex-col gap-12 sm:px-6">
      <div className="flex w-full flex-col items-start gap-8 lg:flex-row lg:gap-12">
        <div className="w-full lg:w-1/2">
          {product ? (
            <ProductImages
              imageUrls={product.imageUrls ?? []}
              alt={product.name}
            />
          ) : (
            <div className="aspect-square w-full animate-pulse rounded-2xl bg-gray-100" />
          )}
        </div>

        <div className="flex w-full flex-col gap-6 lg:w-1/2">
          {product ? (
            <div className="flex flex-col gap-3">
              {category ? (
                <Link
                  href={`/category/${category.id}/${toPathSlug(category.title)}`}
                  className="w-fit text-[13px] text-lightBlack"
                >
                  {category.title}
                </Link>
              ) : null}
              {product.brand ? (
                product.brand.isActive ? (
                  <Link
                    href={`/brand/${product.brand.id}/${toPathSlug(product.brand.name)}`}
                    className="flex w-fit items-center gap-2 rounded-full border border-[#eeeeee] px-3 py-1 text-[13px] text-[#5f5f5f]"
                  >
                    {product.brand.logoUrl ? (
                      <Image
                        src={product.brand.logoUrl}
                        alt=""
                        width={28}
                        height={28}
                        quality={70}
                        className="h-7 w-7 rounded-full object-contain"
                      />
                    ) : null}
                    {product.brand.name}
                  </Link>
                ) : (
                  <span className="text-[13px] text-[#5f5f5f]">
                    {product.brand.name}
                  </span>
                )
              ) : null}
              <h1 className="text-[28px] font-semibold leading-snug text-black1">
                {product.name}
              </h1>
              {product.englishName?.trim() ? (
                <p className="text-[13px] text-lightBlack">{product.englishName}</p>
              ) : null}
              {product.metaDescription?.trim() ? (
                <p className="text-[15px] leading-7 text-[#5f5f5f]">
                  {product.metaDescription}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="h-[30px] w-[200px] animate-pulse rounded bg-gray-100" />
          )}

          {product?.variations?.length ? (
            <div className="flex flex-col gap-4">
              {product.variations.map((variation) => (
                <div key={variation.id} className="flex flex-col gap-2">
                  <span className="text-[14px] font-medium text-[#252525]">
                    {variation.variationName}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {variation.variations.map((variationType) => {
                      const selected =
                        selectedProductVariation?.variationId === variation.id &&
                        selectedProductVariation?.variationValueid ===
                          variationType.id;
                      return (
                        <button
                          key={variationType.id}
                          type="button"
                          onClick={() =>
                            setSelectedProductVariation({
                              price: variationType.price,
                              variationId: variation.id,
                              variationValueid: variationType.id,
                              discount: variationType.discount,
                            })
                          }
                          className={classNames(
                            "rounded-full border px-3 py-1.5 text-[14px]",
                            selected
                              ? "border-green2 bg-green1/10"
                              : "border-[#e5e5e5]",
                            !variationType.instock
                              ? "text-lightBlack"
                              : selected
                                ? "text-black1"
                                : "text-[#353535]"
                          )}
                        >
                          {variationType.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {specRows.length ? <ProductSpecs rows={specRows} /> : null}

          {product ? (
            <ProductBuyPanel
              price={unitPrice}
              discount={unitDiscount}
              inStock={inStock}
              quantityInCart={quantityInCart}
              onAdd={addCurrentProduct}
              onIncrement={() =>
                incrementProductNumber(
                  selectedProductVariation?.variationValueid,
                  product.id
                )
              }
              onDecrement={() =>
                decrementProductNumber(
                  selectedProductVariation?.variationValueid,
                  product.id
                )
              }
              onRemove={() =>
                removeProductFromOrder(
                  selectedProductVariation?.variationValueid,
                  product.id
                )
              }
            />
          ) : null}
        </div>
      </div>

      <div className="flex w-full max-w-[720px] flex-col gap-10">
        <nav className="flex flex-row gap-6 border-b border-[#eeeeee]">
          {showArticle ? (
            <button
              type="button"
              onClick={() =>
                contentRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }
              className={sectionClass("article")}
            >
              معرفی
            </button>
          ) : null}
          {showFullSpecs ? (
            <button
              type="button"
              onClick={() =>
                specsRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }
              className={sectionClass("specs")}
            >
              ویژگی‌ها
            </button>
          ) : null}
          <button
            type="button"
            onClick={() =>
              commentsRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              })
            }
            className={sectionClass("comments")}
          >
            دیدگاه‌ها
          </button>
        </nav>

        {showArticle && product?.content ? (
          <div ref={contentRef} className="scroll-mt-6">
            <Content contentForView={product.content} />
          </div>
        ) : null}

        {showFullSpecs ? (
          <div ref={specsRef} className="flex scroll-mt-6 flex-col gap-4">
            <h2 className="text-[22px] font-medium text-black1">ویژگی‌ها</h2>
            <ProductSpecs rows={specRows} />
          </div>
        ) : null}

        <Comments commentsRef={commentsRef} productId={productId} />
      </div>

      {related?.products?.length ? (
        <ProductCarousel
          title="دیگران هم خریده اند"
          products={related.products}
        />
      ) : null}
    </section>
  );
}
