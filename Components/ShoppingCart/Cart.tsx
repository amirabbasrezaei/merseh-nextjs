"use client";
import React from "react";
import Button from "../Button";
import { useRecoilState } from "recoil";
import { shopingCartStateAtom } from "./HeaderShoppingCart";
import Image from "next/image";
import Link from "next/link";
import { Minus_Svg, Plus_Svg } from "../SVGS";
import splitNumber from "../utils/splitNumber";

export default function Cart() {
  const [shoppingCart, setShoppingCart] = useRecoilState(shopingCartStateAtom);
  return (
    <section className="flex flex-row w-full gap-4 p-10">
      {/* <div className="basis-2/3 flex flex-col">
        <div id="table_head" className="bg-gray-100 rounded-sm flex flex-row justify-between">
          <span className=""></span>
          <span>قیمت واحد</span>
          <span>تعداد</span>
          <span>قیمت نهایی</span>
        </div>
        {shoppingCart.orderitems?.map((prOrder) => (
            <div className="pb-6 flex flex-row w-full justify-between">
              <div className="flex flex-row items-center">
                <Image
                  alt={prOrder.imageUrl?.split("/").at(-1) || ""}
                  width={120}
                  height={120}
                  src={prOrder.imageUrl || ""}
                />
                {prOrder.name}
              </div>
              <div></div>
              <div>{prOrder.numberOfProduct}</div>
              <div>1961</div>
            </div>
          ))}
      </div> */}
      <table className="table-auto basis-2/3 ">
        <thead className="bg-[#F5F5F5] rounded-lg ">
          <tr className="font-[300]  h-10 rounded-lg">
            <th className="font-[400] text-black1"> </th>

            <th className="font-[400] text-black1">قیمت واحد</th>
            <th className="font-[400] text-black1">تعداد</th>
            <th className="font-[400] text-black1">قیمت نهایی</th>
          </tr>
        </thead>
        <tbody className="w-full">
          {shoppingCart.orderitems?.map((prOrder, index) => (
            <tr key={index} className="pb-6">
              <td className=" ">
                <Link
                  className="flex flex-row items-center"
                  href={`/product/${prOrder.productId}`}
                >
                  <Image
                    alt={prOrder.imageUrl?.split("/").at(-1) || ""}
                    width={120}
                    height={120}
                    src={prOrder.imageUrl || ""}
                  />
                  <div className="flex flex-row gap-2 items-center">
                    <span className="text-[#323232]">{prOrder.name}</span>
                    {prOrder.variationValueName?.length ? (
                      <span className="text-[14px] text-[#616161] font-[500]">
                        {`- ${prOrder.variationValueName} `}
                      </span>
                    ) : null}
                  </div>
                </Link>
              </td>
              <td className="text-center text-[#444444]">{splitNumber(prOrder.price)}</td>
              <td className="text-center ">
                <div className="text-center flex flex-row items-center justify-center gap-6">
                  <Plus_Svg classname="w-5 h-5 fill-[#444444]" />
                  <span className="text-center text-[18px] text-[#444444]">{prOrder.numberOfProduct}</span>
                  <Minus_Svg classname="w-5 h-5 fill-[#444444]" />
                </div>
              </td>
              <td className="text-center text-[#444444]">
                {splitNumber(prOrder.price * prOrder.numberOfProduct)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="h-full gap-4 flex flex-col items-center justify-center w-full basis-1/3 ">
        <div className="w-[70%] py-6 gap-5 border border-[#EAEAEA] rounded-[8px] flex flex-col items-center justify-center ">
          <div className="flex flex-row items-center justify-center gap-1 w-[80%]">
            {true ? (
              <div className="animate-pulse h-8 w-full bg-gray-100" />
            ) : (
              <>
                <span className="text-green1 text-[25px] font-[600]"></span>
                <span className="text-black1 text-[10px]">تومان</span>
              </>
            )}
          </div>
        </div>
        <Button text="تائید و ثبت سفارش" className="w-[70%]" />
      </div>
    </section>
  );
}
