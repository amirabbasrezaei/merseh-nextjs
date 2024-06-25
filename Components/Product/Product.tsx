"use client";

import React, { useEffect, useState } from "react";
import { trpc } from "@/utils/trpc";
import classNames from "classnames";
import ProductImages from "./ProductImages";
import Button from "../Button";
import splitNumber from "../utils/splitNumber";
import { AnimatePresence, motion } from "framer-motion";
import ProductCarousel from "../Home/ProductCarousel";

import useShoppingCart, { ShoppingCart } from "../useShoppingCart";
import toast from "react-hot-toast";
import useWindowSize from "../useWindowSize";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Minus_Svg, Plus_Svg, TrashBin_SVG } from "../SVGS";
import Link from "next/link";

type Props = {
  productId: string;
};

type ProductVariation = {
  price: number;
  variationValueid: number;
  variationId: number;
} | null;
export default function Product({ productId }: Props) {
  const { width } = useWindowSize();
  const params = useSearchParams();
  console.log(params.get("variation"));
  const router = useRouter();
  const [productInShoppingCart, setProductInShoppingCart] = useState<
    ShoppingCart["orderitems"][0] | null
  >();
  const {
    addProduct,
    getProduct,
    incrementProductNumber,
    items,
    decrementProductNumber,
    removeProductFromOrder,
  } = useShoppingCart();
  const {
    data: productData,
    isFetched,
    isLoading,
  } = trpc.product.getproduct.useQuery({
    productId: Number(productId),
  });

  const initialProduct: ProductVariation = productData?.product?.variations
    ?.length
    ? {
        variationId: 0,
        variationValueid: 0,
        price: 0,
      }
    : null;

  const [selectedProductVariation, setSelectedProductVariation] =
    useState<ProductVariation>(initialProduct);

  useEffect(() => {
    if (isFetched) {
      setSelectedProductVariation(
        productData?.product?.variations?.length
          ? {
              variationId:
                Number(params.get("variation")) ||
                productData?.product?.variations[0].id,
              variationValueid:
                Number(params.get("variationValue")) ||
                productData?.product?.variations[0].variations[0].id,
              price:
                productData?.product?.variations
                  .find((e) => e.id === Number(params.get("variation")))
                  ?.variations.find(
                    (e) => e.id === Number(params.get("variationValue"))
                  )?.price ||
                productData?.product?.variations[0].variations[0].price,
            }
          : null
      );
    }
  }, [isFetched]);

  useEffect(() => {
    if (productData?.product) {
      const selectedProduct = getProduct(
        productData.product.id,
        selectedProductVariation?.variationValueid
      );
      setProductInShoppingCart(selectedProduct ? selectedProduct : null);
    }
  }, [selectedProductVariation, items, productData]);

  return (
    <>
      <section className="flex sm:px-20 flex-col gap-20 w-full">
        <div className="sm:h-[450px] h-fit w-full flex flex-col sm:flex-row sm:mt-[85px]">
          <div className="h-full w-full sm:basis-4/12 ">
            {productData?.product ? (
              <ProductImages imageUrls={productData.product.imageUrls} />
            ) : (
              <div className="sm:w-[400px] w-full h-[400px] bg-gray-100 animate-pulse rounded-[8px]"></div>
            )}
          </div>

          <div className="h-full  w-full sm:basis-5/12 p-4 flex flex-col gap-10">
            {productData?.product ? (
              <h1 className="text-[26px] text-black1">
                {productData?.product?.name}
              </h1>
            ) : (
              <div className="w-[200px] h-[30px] bg-gray-100 animate-pulse rounded-[4px]"></div>
            )}

            {!isLoading && productData?.product ? (
              productData?.product?.variations.map((variation) => (
                <div
                  key={variation.id}
                  className="flex flex-row items-center gap-2"
                >
                  <span className="ml-4 text-[18px] text-[#252525]">
                    {variation.variationName}
                  </span>
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-4">
                      {variation.variations.map(
                        (variationType, variationTypeIndex) => (
                          <div
                            key={variationType.id}
                            className="flex items-center gap-2"
                          >
                            <div className="w-[21px] cursor-pointer h-[21px] flex items-center justify-center border-2 border-[#DFDFDF] rounded-full">
                              <input
                                checked={
                                  selectedProductVariation?.variationId ===
                                    variation.id &&
                                  selectedProductVariation.variationValueid ===
                                    variationType.id
                                }
                                onChange={(e) =>
                                  e.target.checked &&
                                  setSelectedProductVariation({
                                    price: variationType.price,
                                    variationId: variation.id,
                                    variationValueid: variationType.id,
                                  })
                                }
                                className={classNames(
                                  "appearance-none cursor-pointer text-center center w-[15px]  h-[15px] rounded-full",
                                  selectedProductVariation?.variationId ===
                                    variation.id &&
                                    selectedProductVariation.variationValueid ===
                                      variationType.id
                                    ? "checked:bg-green1"
                                    : ""
                                )}
                                type="radio"
                              />
                            </div>
                            <span
                              onClick={() =>
                                setSelectedProductVariation({
                                  price: variationType.price,
                                  variationId: variation.id,
                                  variationValueid: variationType.id,
                                })
                              }
                              className="text-[14px] cursor-pointer text-[#535353]"
                            >
                              {variationType.name}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-row gap-5">
                <div className="flex flex-row gap-2 items-center">
                  <div className="w-[70px] h-6 bg-gray-100 animate-pulse rounded-[4px]"></div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                  <div className="w-6 h-6 rounded-full bg-gray-100 animate-pulse"></div>
                  <div className="w-[60px] h-6 bg-gray-100 animate-pulse rounded-[4px]"></div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                  <div className="w-6 h-6 rounded-full bg-gray-100 animate-pulse"></div>
                  <div className="w-[60px] h-6 bg-gray-100 animate-pulse rounded-[4px]"></div>
                </div>
              </div>
            )}
          </div>
          <div className="h-full flex flex-col items-center gap-4 justify-center w-full sm:basis-3/12 ">
            <div className="w-full py-6 gap-5 border border-[#EAEAEA] rounded-[8px] flex flex-col items-center justify-center ">
              <div className="flex flex-row items-center justify-center gap-1 w-[80%]">
                {isLoading ? (
                  <div className="animate-pulse h-8 w-full bg-gray-100" />
                ) : (
                  <>
                    <span className="text-green1 text-[25px] font-[600]">
                      {selectedProductVariation?.price
                        ? splitNumber(selectedProductVariation?.price)
                        : splitNumber(productData?.product?.price)}
                    </span>
                    <span className="text-black1 text-[10px]">تومان</span>
                  </>
                )}
              </div>
            </div>
            <div className="w-full flex flex-col items-center justify-center gap-5">
              {productInShoppingCart ? (
                <motion.div className="flex flex-row w-full justify-evenly bg-gray-50 py-2 rounded-[8px]">
                  <button
                    className=""
                    onClick={(e) => {
                      e.preventDefault();
                      productData?.product &&
                        incrementProductNumber(
                          selectedProductVariation?.variationValueid,
                          productData.product.id
                        );
                    }}
                  >
                    <Plus_Svg classname="w-6 fill-green2" />
                  </button>
                  <span className="text-[23px]">
                    {productInShoppingCart.numberOfProduct}
                  </span>
                  <button
                    className=""
                    onClick={(e) => {
                      e.preventDefault();
                      productData?.product &&
                        (productInShoppingCart.numberOfProduct > 1
                          ? decrementProductNumber(
                              selectedProductVariation?.variationValueid,
                              productData.product.id
                            )
                          : removeProductFromOrder(
                              selectedProductVariation?.variationValueid,
                              productData.product.id
                            ));
                    }}
                  >
                    {productInShoppingCart.numberOfProduct > 1 ? (
                      <Minus_Svg classname="w-6 fill-green2" />
                    ) : (
                      <TrashBin_SVG classname="stroke-red-600 w-6" />
                    )}
                  </button>
                </motion.div>
              ) : (
                <motion.div className="w-full">
                  <Button
                    text="افزودن به سبد خرید"
                    className="w-full"
                    isLoading={isLoading}
                    onClick={() =>
                      productData?.product &&
                      addProduct(
                        productData.product.name,
                        selectedProductVariation?.price
                          ? selectedProductVariation.price
                          : productData?.product?.price
                          ? productData?.product.price
                          : 0,
                        productData.product.id,
                        selectedProductVariation?.variationId,
                        selectedProductVariation?.variationValueid
                      ).then(() => {
                        toast.custom(
                          (t) =>
                            t.visible ? (
                              <motion.div
                                transition={{ duration: 0.3 }}
                                initial={
                                  width > 640
                                    ? {
                                        scale: 0.6,
                                        translateX: 100,
                                        opacity: 0,
                                      }
                                    : {
                                        scale: 0.6,
                                        translateY: -100,
                                        opacity: 0,
                                      }
                                }
                                animate={
                                  width > 640
                                    ? {
                                        scale: 1,
                                        translateX: 0,
                                        opacity: 1,
                                      }
                                    : {
                                        scale: 1,
                                        translateY: 0,
                                        opacity: 1,
                                      }
                                }
                                exit={
                                  width > 640
                                    ? {
                                        scale: 0.6,
                                        translateX: 100,
                                        opacity: 0,
                                      }
                                    : {
                                        scale: 0.6,
                                        translateY: -100,
                                        opacity: 0,
                                      }
                                }
                                className="h-[60px] origin-top sm:origin-right w-fit gap-5 px-3 bg-white flex flex-row items-center justify-center shadow-md rounded-[12px]"
                              >
                                <span className="text-lightBlack text-[12px] sm:text-[15px]">{`${name} به سبد خرید اضافه شد`}</span>
                                <span
                                  onClick={() => {
                                    toast.dismiss();
                                    router.push("/cart/checkout");
                                  }}
                                  className="cursor-pointer text-green1 font-[400] text-[12px] sm:text-[15px]"
                                >
                                  مشاهده سبد خرید
                                </span>
                                <div
                                  className="cursor-pointer rounded-[10px] p-2 bg-gray-100"
                                  onClick={() => toast.dismiss()}
                                >
                                  <Check classname="fill-black1 w-5 h-auto  " />
                                </div>
                              </motion.div>
                            ) : null,
                          {
                            position: width > 640 ? "top-left" : "top-center",
                            duration: 6000,
                          }
                        );
                      })
                    }
                  />
                </motion.div>
              )}
              {productInShoppingCart &&
              productInShoppingCart.numberOfProduct > 0 ? (
                <Link href={"/cart/checkout"}>
                  <span className="text-green2">مشاهده سبد خرید</span>
                </Link>
              ) : null}
            </div>
          </div>
        </div>
        <div className="sm:px-20 flex flex-col gap-4">
          <h3 className="text-[22px] font-[500] text-lightBlack">
            معرفی محصول
          </h3>
          {!isLoading && productData?.product
            ? productData?.product?.content.map((p, index) => {
                if (p.type === "text") {
                  return (
                    <p
                      key={index}
                      className="font-[300] text-[#4a4a4a] leading-9"
                    >
                      {p.content as string}
                    </p>
                  );
                }
                if (p.type === "title") {
                  return (
                    <h3
                      key={index}
                      className="font-[500] text-[#5a5a5a] text-[18px] mb-[-10px]"
                    >
                      {p.content as string}
                    </h3>
                  );
                }
                if (p.type === "image") {
                  return (
                    <img
                      key={index}
                      // @ts-ignore
                      src={p.content.src as string}
                      // @ts-ignore
                      alt={p.content.name}
                      className="w-full h-auto"
                    />
                  );
                }
                if (p.type === "break") {
                  return <br key={index} />;
                }
              })
            : Array.from(Array(2)).map((_, i) => (
                <div className="flex flex-col gap-3 my-5" key={i}>
                  <div className="bg-gray-100 w-[150px] h-[26px] rounded-[7px]"></div>
                  <div className="bg-gray-100 w-full h-[20px] rounded-[4px]"></div>
                  <div className="bg-gray-100 w-full h-[20px] rounded-[4px]"></div>
                  <div className="bg-gray-100 w-full h-[20px] rounded-[4px]"></div>
                </div>
              ))}
        </div>

        <div className="w-full flex flex-col gap-5">
          <h3 className="text-[22px] font-[500] text-black1">نظرات</h3>
          <textarea className="appearance-none p-4 w-full sm:w-[500px] h-[100px] outline-none rounded-[10px] border border-[#ECECEC] bg-[#F9F9F9] " />
          <Button className="w-[170px] h-[40px]" text="ارسال نظر" />
        </div>
        <ProductCarousel title="دیگران هم خریده اند" sliderStartDelay={0} />
      </section>
    </>
  );
}
