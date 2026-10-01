"use client";

import React, { useEffect, useRef, useState } from "react";
import { trpc } from "@/utils/trpc";
import classNames from "classnames";
import ProductImages from "./ProductImages";
import ProductSpecs, { parseDetails, SpecHighlights } from "./ProductSpecs";
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
import { Eyebrow } from "../Home/ui/SectionHeader";
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
  freeShipping?: boolean;
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
      const line = 140;
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
      selectedProductVariation?.variationValueid,
      {
        discount: unitDiscount,
        imageUrl: product.imageUrls?.[0],
        freeShipping: product.freeShipping,
      }
    ).then(() => notifyAdded(product.name));
  };

  const sectionClass = (id: string) =>
    classNames(
      "home-focus text-small transition-colors",
      visibleSection === id
        ? "font-medium text-plum-900"
        : "text-lightBlack hover:text-plum-900"
    );

  return (
    <section id="productSection" className="flex w-full flex-col gap-16">
      <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(22rem,26rem)] lg:items-start lg:gap-x-12 lg:gap-y-14">
        <div className="order-1 min-w-0 lg:col-start-1 lg:row-start-1">
          {product ? (
            <ProductImages
              imageUrls={product.imageUrls ?? []}
              alt={product.name}
            />
          ) : (
            <div className="h-56 w-full animate-pulse rounded-panel bg-sand sm:h-64 lg:h-80" />
          )}
        </div>

        <div className="order-2 flex w-full flex-col gap-7 lg:sticky lg:top-28 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          {product ? (
            <div className="flex flex-col gap-4">
              {category ? (
                <Link
                  href={`/category/${category.id}/${toPathSlug(category.title)}`}
                  className="home-focus w-fit rounded"
                >
                  <Eyebrow>{category.title}</Eyebrow>
                </Link>
              ) : null}
              <h1 className="text-pretty text-display text-plum-900 md:text-display-md">
                {product.name}
              </h1>
              {product.brand || product.englishName?.trim() ? (
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-lightBlack">
                  {product.brand ? (
                    product.brand.isActive ? (
                      <Link
                        href={`/brand/${product.brand.id}/${toPathSlug(product.brand.name)}`}
                        className="home-focus inline-flex items-center gap-1.5 font-medium text-plum-900 hover:text-mauve-700"
                      >
                        {product.brand.logoUrl ? (
                          <Image
                            src={product.brand.logoUrl}
                            alt=""
                            width={20}
                            height={20}
                            quality={70}
                            className="h-5 w-5 rounded-full object-contain"
                          />
                        ) : null}
                        {product.brand.name}
                      </Link>
                    ) : (
                      <span className="font-medium text-plum-900">{product.brand.name}</span>
                    )
                  ) : null}
                  {product.brand && product.englishName?.trim() ? (
                    <span aria-hidden className="h-1 w-1 rounded-full bg-mauve-400" />
                  ) : null}
                  {product.englishName?.trim() ? (
                    <span>{product.englishName}</span>
                  ) : null}
                </p>
              ) : null}
              {product.metaDescription?.trim() ? (
                <p className="text-body text-plum-900/75">
                  {product.metaDescription}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="h-8 w-48 animate-pulse rounded-full bg-sand" />
          )}

          {product?.variations?.length ? (
            <div className="flex flex-col gap-5">
              {product.variations.map((variation) => (
                <div key={variation.id} className="flex flex-col gap-2">
                  <span className="text-small font-medium text-plum-900">
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
                            "home-focus rounded-full px-4 py-2 text-small ring-1 transition-colors",
                            selected
                              ? "bg-plum-900 font-medium text-ivory ring-plum-900"
                              : "bg-white text-plum-900 ring-hairline hover:bg-blush-100 hover:ring-mauve-400",
                            !variationType.instock && "opacity-50"
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

          {specRows.length ? <SpecHighlights rows={specRows} /> : null}

          {product ? (
            <ProductBuyPanel
              productName={product.name}
              price={unitPrice}
              discount={unitDiscount}
              inStock={inStock}
              freeShipping={Boolean(product.freeShipping)}
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

        <div className="order-3 flex min-w-0 flex-col gap-14 lg:col-start-1 lg:row-start-2">
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
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
            <div ref={contentRef} className="flex scroll-mt-36 flex-col gap-4">
              <Eyebrow>محصول</Eyebrow>
              <h2 className="text-h2 text-plum-900 md:text-h2-md">معرفی</h2>
              <div className="min-w-0 max-w-3xl [&_img]:h-auto [&_img]:max-w-full">
                <Content contentForView={product.content} />
              </div>
            </div>
          ) : null}

          {showFullSpecs ? (
            <div ref={specsRef} className="flex scroll-mt-36 flex-col gap-4">
              <Eyebrow>جزئیات</Eyebrow>
              <h2 className="text-h2 text-plum-900 md:text-h2-md">ویژگی‌ها</h2>
              <ProductSpecs rows={specRows} />
            </div>
          ) : null}
        </div>
      </div>

      <Comments commentsRef={commentsRef} productId={productId} />

      {related?.products?.length ? (
        <ProductCarousel
          title="دیگران هم خریده اند"
          products={related.products}
        />
      ) : null}
    </section>
  );
}
