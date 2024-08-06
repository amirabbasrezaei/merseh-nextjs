"use client";
import React, { useEffect, useState } from "react";
import Button from "../Button";
import { useRecoilState } from "recoil";

import Image from "next/image";
import Link from "next/link";
import { Minus_Svg, Plus_Svg } from "../SVGS";
import splitNumber from "../utils/splitNumber";
import { trpc } from "@/utils/trpc";
import { themeRecoilStateAtom } from "../ThemeController";
import useShoppingCart from "../useShoppingCart";

export default function Checkout() {
  const [themeStore, setThemeStore] = useRecoilState(themeRecoilStateAtom);
  const [isClient, setIsClient] = useState(false);
  const {
    decrementProductNumber,
    incrementProductNumber,
    removeProductFromOrder,
    finalPrice,
    items,
  } = useShoppingCart();
  const { data, error, refetch } = trpc.order.getActiveOrder.useQuery();

  useEffect(() => {
    setIsClient(true);
    if (error?.message && JSON.parse(error.message).text === "please log in") {
      setThemeStore({ openAuthModal: true });
    }
  }, [error]);

  return (
    <section className="flex flex-col sm:flex-row w-full gap-[40px]  sm:p-10">
      <table className="table-auto basis-9/12 ">
        <thead className="bg-[#F5F5F5] rounded-lg ">
          <tr className="font-[300] text-[12px] sm:text-[14px] h-10 rounded-lg">
            <th className="font-[400] text-black1"> </th>

            <th className="font-[400]  text-black1">قیمت واحد</th>
            <th className="font-[400] text-black1">تعداد</th>
            <th className="font-[400] text-black1">قیمت نهایی</th>
          </tr>
        </thead>
        <tbody className="w-full">
          {items.length && isClient
            ? items?.map((prOrder, index) => (
                <tr key={index} className="pb-6">
                  <td className=" ">
                    <Link
                      className="flex flex-row items-center gap-2"
                      href={`/product/${prOrder.productId}`}
                    >
                      <Image
                        alt={prOrder.imageUrl?.split("/").at(-1) || ""}
                        width={160}
                        height={160}
                        src={prOrder.imageUrl || ""}
                        className="w-[50px] sm:w-[100px] md:w-[160px]"
                      />
                      <div className="flex flex-row gap-2 items-center">
                        <span className="text-[#323232] text-[12px] md:text-[17px]">
                          {prOrder.name}
                        </span>
                        {prOrder.variationValueName?.length ? (
                          <span className="text-[10px] sm:text-[14px] md:text-[17px] text-[#616161] font-[500]">
                            {`- ${prOrder.variationValueName} `}
                          </span>
                        ) : null}
                      </div>
                    </Link>
                  </td>
                  <td className="text-center text-[12px] md:text-[17px] text-[#444444]">
                    {splitNumber(prOrder.price)}
                  </td>
                  <td className="text-center ">
                    <div className="text-center flex flex-row items-center justify-center gap-2 sm:gap-6">
                      <div
                        onClick={() => {
                          incrementProductNumber(
                            prOrder.variationValueId,
                            prOrder.productId
                          );
                        }}
                        className="cursor-pointer"
                      >
                        <Plus_Svg classname="w-5 h-5 fill-[#444444]" />
                      </div>
                      <span className="text-center text-[15px] sm:text-[18px] text-[#444444]">
                        {prOrder.numberOfProduct}
                      </span>
                      <div
                        onClick={() => {
                          prOrder.numberOfProduct <= 1
                            ? removeProductFromOrder(
                                prOrder.variationValueId,
                                prOrder.productId
                              )
                            : decrementProductNumber(
                                prOrder.variationValueId,
                                prOrder.productId
                              );
                        }}
                        className="cursor-pointer"
                      >
                        <Minus_Svg classname="w-5 h-5 fill-[#444444]" />
                      </div>
                    </div>
                  </td>
                  <td className="text-center text-[12px] md:text-[17px] text-[#444444]">
                    {splitNumber(prOrder.price * prOrder.numberOfProduct)}
                  </td>
                </tr>
              ))
            : null}
        </tbody>
      </table>
      <div className="h-full gap-4 flex flex-col items-center justify-center w-full basis-3/12 ">
        <div className="w-full py-6 gap-5 border border-[#EAEAEA] rounded-[8px] flex flex-col items-center justify-center ">
          <div className="flex flex-col items-center justify-center gap-4 w-[80%]">
            <div className="flex flex-row gap-2 items-center justify-between w-full">
              <span className="text-lightBlack text-[15px] font-[500] w-full">
                جمع سبد خرید
              </span>
              {finalPrice && isClient ? (
                <span className="text-green1 font-[500] text-[18px] flex flex-row gap-1 items-center">
                  {splitNumber(finalPrice)}
                  <span className="text-[10px] text-black1 font-[400]">
                    تومان
                  </span>
                </span>
              ) : (
                <div className="h-8 animate-pulse rounded-md bg-gray-100 w-full" />
              )}
            </div>
            <div className="flex flex-row gap-2 items-center justify-between w-full">
              <span className="text-lightBlack text-[15px] font-[500]">
                هزینه ارسال
              </span>
              <span className="text-green1 font-[400] text-[15px]">
                وابسته به نوع ارسال
              </span>
            </div>
          </div>
        </div>
        <Link className="w-full h-full" href={"/cart/shipping"}>
          <Button text="تائید و ثبت سفارش" className="w-full" />
        </Link>
      </div>
    </section>
  );
}
