"use client";
import React, { useEffect } from "react";
import Button from "../Button";
import { useRecoilState } from "recoil";
import { ShoppingCart, shopingCartStateAtom } from "./HeaderShoppingCart";
import Image from "next/image";
import Link from "next/link";
import { Minus_Svg, Plus_Svg } from "../SVGS";
import splitNumber from "../utils/splitNumber";

export default function Checkout() {
  const [shoppingCart, setShoppingCart] = useRecoilState(shopingCartStateAtom);

  const incrementProductNumber = (
    variationValueId: number | undefined,
    productId: number
  ) => {
    if (variationValueId) {
      const newValue = shoppingCart.orderitems.map(
        (prOrder: ShoppingCart["orderitems"][0]) => {
          if (prOrder.variationValueId === variationValueId) {
            return { ...prOrder, numberOfProduct: prOrder.numberOfProduct + 1 };
          }
          return prOrder;
        }
      );
      setShoppingCart((state) => ({
        ...state,
        orderitems: newValue,
        updateActiveOrder: true,
      }));
      return;
    }

    if (productId) {
      const newValue = shoppingCart.orderitems.map(
        (prOrder: ShoppingCart["orderitems"][0]) => {
          if (prOrder.productId === productId) {
            return { ...prOrder, numberOfProduct: prOrder.numberOfProduct + 1 };
          }
          return prOrder;
        }
      );
      setShoppingCart((state: ShoppingCart) => ({
        ...state,
        orderitems: newValue,
        updateActiveOrder: true,
      }));
    }
  };

  const decrementProductNumber = (
    variationValueId: number | undefined,
    productId: number
  ) => {
    if (variationValueId) {
      const newValue = shoppingCart.orderitems.map(
        (prOrder: ShoppingCart["orderitems"][0]) => {
          if (prOrder.variationValueId === variationValueId) {
            return { ...prOrder, numberOfProduct: prOrder.numberOfProduct - 1 };
          }
          return prOrder;
        }
      );
      setShoppingCart((state) => ({
        ...state,
        orderitems: newValue,
        updateActiveOrder: true,
      }));
      return;
    }

    if (productId) {
      const newValue = shoppingCart.orderitems.map(
        (prOrder: ShoppingCart["orderitems"][0]) => {
          if (prOrder.productId === productId) {
            return { ...prOrder, numberOfProduct: prOrder.numberOfProduct - 1 };
          }
          return prOrder;
        }
      );
      setShoppingCart((state: ShoppingCart) => ({
        ...state,
        orderitems: newValue,
        updateActiveOrder: true,
      }));
    }
  };

  const removeProductFromOrder = (
    variationValueId: number | undefined,
    productId: number
  ) => {
    if (variationValueId) {
      const remainProducts = shoppingCart.orderitems.filter(
        (pr) => pr.variationValueId !== variationValueId
      );
      setShoppingCart((state) => ({
        ...state,
        orderitems: remainProducts,
        updateActiveOrder: true,
      }));
      return;
    }
    if (productId) {
      const remainProducts = shoppingCart.orderitems.filter(
        (pr) => pr.productId !== productId
      );
      setShoppingCart((state) => ({
        ...state,
        orderitems: remainProducts,
        updateActiveOrder: true,
      }));
    }
  };

  return (
    <section className="flex flex-row w-full gap-[40px] p-10">
      <table className="table-auto basis-9/12 ">
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
                    width={160}
                    height={160}
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
              <td className="text-center text-[#444444]">
                {splitNumber(prOrder.price)}
              </td>
              <td className="text-center ">
                <div className="text-center flex flex-row items-center justify-center gap-6">
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
                  <span className="text-center text-[18px] text-[#444444]">
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
              <td className="text-center text-[#444444]">
                {splitNumber(prOrder.price * prOrder.numberOfProduct)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="h-full gap-4 flex flex-col items-center justify-center w-full basis-3/12 ">
        <div className="w-full py-6 gap-5 border border-[#EAEAEA] rounded-[8px] flex flex-col items-center justify-center ">
          <div className="flex flex-col items-center justify-center gap-4 w-[80%]">
            <div className="flex flex-row gap-2 items-center justify-between w-full">
              <span className="text-lightBlack text-[15px] font-[500]">
                جمع سبد خرید
              </span>
              <span className="text-green1 font-[600] text-[18px]">
                {splitNumber(shoppingCart.price?.totalPrice)}
                <span className="text-[10px] text-black1 font-[400]">
                  {" "}
                  تومان
                </span>
              </span>
            </div>
            <div className="flex flex-row gap-2 items-center justify-between w-full">
              <span className="text-lightBlack text-[15px] font-[500]">
                هزینه ارسال
              </span>
              <span className="text-green1 font-[400] text-[15px]">
                وابسته به نوع ارسال
              </span>
            </div>
            {/* {shoppingCart.updateActiveOrder ? (
              <div className="animate-pulse h-8 w-full bg-gray-100" />
            ) : (
              <>
                <span className="text-green1 text-[25px] font-[600]">{splitNumber(shoppingCart.price?.totalPrice)}</span>
                <span className="text-black1 text-[10px]">تومان</span>
              </>
            )} */}
          </div>
        </div>
        <Link className="w-full h-full" href={"/cart/shipping"}>
          <Button text="تائید و ثبت سفارش" className="w-full" />
        </Link>
      </div>
    </section>
  );
}
