"use client";

import React, { useEffect, useState } from "react";
import { trpc } from "@/utils/trpc";
import classNames from "classnames";
import ProductImages from "./ProductImages";
import Button from "../Button";
import splitNumber from "../utils/splitNumber";
import Skeleton from "react-loading-skeleton";
import { atom, useRecoilState } from "recoil";
import { shopingCartStateAtom } from "../Cart/HeaderShoppingCart";
import ProductCarousel from "../Home/ProductCarousel";
import Image from "next/image";

type Props = {
  productId: string;
};

type ProductVariation = {
  price: number;
  variationValueid: number;
  variationId: number;
} | null;
export default function Product({ productId }: Props) {
  const {
    data: productData,
    isFetched,
    isLoading,
  } = trpc.product.getproduct.useQuery({
    productId: Number(productId),
  });
  const [shopingCartState, setShoppingCart] =
    useRecoilState(shopingCartStateAtom);

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
              variationId: productData.product.variations[0].id,
              variationValueid:
                productData.product.variations[0].variations[0].id,
              price: productData.product.variations[0].variations[0].price,
            }
          : null
      );
    }
  }, [isFetched]);

  const updateShoppingCart = (
    price: number,
    variationId?: number,
    variationValueId?: number
  ) => {
    const newShoppingCartItem = {
      name: productData?.product?.name,
      price,
      numberOfProduct: 1,
      variationValueId,
      variationId,
      productId: productData?.product?.id,
    };

    setShoppingCart((lastShoppingCartState: any) => {
      if (lastShoppingCartState?.orderitems?.length) {
        return {
          ...lastShoppingCartState,
          updateActiveOrder: lastShoppingCartState.updateActiveOrder,
          orderitems: [
            ...lastShoppingCartState.orderitems,
            newShoppingCartItem,
          ],
        };
      } else {
        return {
          ...lastShoppingCartState,
          updateActiveOrder: lastShoppingCartState.updateActiveOrder,
          orderitems: [newShoppingCartItem],
        };
      }
    });
  };

  return (
    <section className="flex sm:px-20 flex-col gap-20 w-full">
      <div className="sm:h-[450px] h-fit w-full flex flex-col sm:flex-row sm:mt-[85px]">
        <div className="h-full w-full sm:basis-4/12 ">
          {productData?.product ? (
            <ProductImages imageUrls={productData.product.imageUrls} />
          ) : null}
        </div>

        <div className="h-full  w-full sm:basis-5/12 p-4 flex flex-col gap-10">
          <h3 className="text-[26px] text-black1">
            {productData?.product?.name}
          </h3>

          {productData?.product?.variations.map((variation) => (
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
                        <div className="w-[21px]  h-[21px] flex items-center justify-center border-2 border-[#DFDFDF] rounded-full">
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
                              "appearance-none text-center center w-[15px]  h-[15px] rounded-full",
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
                        <span className="text-[14px] text-[#535353]">
                          {variationType.name}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
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
          <Button
            text="افزودن به سبد خرید"
            className="w-full"
            onClick={() =>
              updateShoppingCart(
                selectedProductVariation?.price
                  ? selectedProductVariation.price
                  : productData?.product?.price
                  ? productData?.product.price
                  : 0,
                selectedProductVariation?.variationId,
                selectedProductVariation?.variationValueid
              )
            }
          />
        </div>
      </div>
      <div className="sm:px-20 flex flex-col gap-4">
        <h3 className="text-[22px] font-[500] text-lightBlack">معرفی محصول</h3>
        {productData?.product?.content.map((p, index) => {
          if (p.type === "text") {
            return (
              <p key={index} className="font-[300] text-[#4a4a4a] leading-9">
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
            return <br />;
          }
        })}
      </div>

      <div className="w-full flex flex-col gap-5">
        <h3 className="text-[22px] font-[500] text-black1">نظرات</h3>
        <textarea className="appearance-none p-4 w-full sm:w-[500px] h-[100px] outline-none rounded-[10px] border border-[#ECECEC] bg-[#F9F9F9] " />
        <Button className="w-[170px] h-[40px]" text="ارسال نظر" />
      </div>
      <ProductCarousel title="دیگران هم خریده اند" sliderStartDelay={0} />
    </section>
  );
}
