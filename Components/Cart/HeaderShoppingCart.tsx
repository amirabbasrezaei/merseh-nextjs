"use client";

import React, { useEffect, useState } from "react";
import { atom, useRecoilState, useRecoilValue } from "recoil";
import { Shop_Cart, Shopping_Cart_Empty, XMark_Svg } from "../SVGS";
import { trpc } from "@/utils/trpc";
import { AnimatePresence, motion } from "framer-motion";
import HeaderShoppingCartItem from "./HeaderShoppingCartItem";
import { useRouter } from "next/navigation";
import { themeRecoilStateAtom } from "../ThemeController";
import { createPortal } from "react-dom";
import Link from "next/link";

export type ShoppingCart = {
  orderitems:
    | {
        name: string;
        productId: number;
        variationId?: number;
        variationValueId?: number;
        price: number;
        numberOfProduct: number;
        imageUrl?: string;
        variationValueName?: string;
      }[];
  showCart: boolean;
  updateActiveOrder: boolean;
  price?: { totalPrice: number };
  activeOrderId?: number;
};

function handleUpdateActiveOrder() {
  return ({ setSelf, onSet }: any) => {
    onSet((newValue: ShoppingCart, oldValue: ShoppingCart) => {
      if (newValue.orderitems.length > oldValue.orderitems.length) {
        const newPrOrder = newValue.orderitems.at(-1);
        const findIndex_On_Variation = oldValue.orderitems.findIndex(
          (e) => e.variationValueId === newPrOrder?.variationValueId
        );
        const findIndex_On_Product = oldValue.orderitems.findIndex(
          (e) => e.productId === newPrOrder?.productId
        );
        console.log(newPrOrder);
        if (findIndex_On_Variation !== -1 && newPrOrder?.variationValueId) {
          const temp: ShoppingCart["orderitems"] = [
            ...oldValue.orderitems.slice(0, findIndex_On_Variation),
            ...oldValue.orderitems.slice(findIndex_On_Variation + 1),
            {
              ...oldValue.orderitems[findIndex_On_Variation],
              numberOfProduct:
                oldValue.orderitems[findIndex_On_Variation].numberOfProduct + 1,
            },
          ];
          const result = {
            ...newValue,
            updateActiveOrder: true,
            orderitems: temp,
          };
          if (localStorage !== undefined) {
            localStorage.setItem("shopCart", JSON.stringify(result));
          }
          setSelf(result);
          return;
        } else if (
          findIndex_On_Product !== -1 &&
          !newPrOrder?.variationValueId
        ) {
          const temp: ShoppingCart["orderitems"] = [
            ...oldValue.orderitems.slice(0, findIndex_On_Product),
            ...oldValue.orderitems.slice(findIndex_On_Product + 1),
            {
              ...oldValue.orderitems[findIndex_On_Product],
              numberOfProduct:
                oldValue.orderitems[findIndex_On_Product].numberOfProduct + 1,
            },
          ];

          const result = {
            ...newValue,
            updateActiveOrder: true,
            orderitems: temp,
          };
          localStorage.setItem("shopCart", JSON.stringify(result.orderitems));
          setSelf(result);
          return;
        } else {
          const result = { ...newValue, updateActiveOrder: true };
          localStorage.setItem("shopCart", JSON.stringify(result.orderitems));
          setSelf(result);

          return;
        }
      } else if (newValue.orderitems.length < oldValue.orderitems.length) {
        localStorage.setItem("shopCart", JSON.stringify(newValue.orderitems));
        setSelf({ ...newValue, updateActiveOrder: false });
        return;
      } else {
        localStorage.setItem("shopCart", JSON.stringify(newValue.orderitems));
        setSelf({ ...newValue, updateActiveOrder: false });
      }
    });
  };
}
// @ts-nocheck
export const shopingCartStateAtom = atom<ShoppingCart>({
  key: "ShopingCart",
  default: {
    orderitems:
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("shopCart") || "")
        : false,
    showCart: false,
    updateActiveOrder: false,
  },
  effects: [handleUpdateActiveOrder()],
});

const cartAnimation = {
  closed: {
    opacity: 0,
    translateY: -5,
    translateX: -50,
    height: 0,
    scale: 0,
    transition: {
      staggerChildren: 0.03,
      damping: 0,
    },
    transformOrigin: ["0%", "top"],
  },
  open: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2, damping: 0 },
    transformOrigin: ["0%", "top"],
    translateY: 0,
    height: 300,
    scale: 1,
    translateX: 0,
  },
};

export default function HeaderShoppingCart() {
  const [themeStore, setThemeStore] = useRecoilState(themeRecoilStateAtom);

  const { data: activeOrderData } = trpc.order.getActiveOrder.useQuery(
    undefined,
    {
      retry: false,
    }
  );
  const {
    error: updateActiveOrderError,
    mutate: mutateActiveOrder,
    data: updateActiveOrderData,
  } = trpc.order.updateActiveOrder.useMutation();

  const [shoppingCartState, setShoppingCartState] =
    useRecoilState(shopingCartStateAtom);

  useEffect(() => {
    if (shoppingCartState.updateActiveOrder) {
      mutateActiveOrder({ selectedProducts: shoppingCartState.orderitems });
    }
  }, [shoppingCartState]);

  useEffect(() => {
    if (shoppingCartState.updateActiveOrder) {
      mutateActiveOrder({
        selectedProducts: JSON.parse(
          localStorage.getItem("shopCart") || ""
        ) as ShoppingCart["orderitems"],
      });
    }
  }, [themeStore]);

  useEffect(() => {
    console.log(activeOrderData?.activeOrder);
    if (activeOrderData?.activeOrder) {
      const activeShoppingCart: ShoppingCart["orderitems"] =
        activeOrderData.activeOrder.ProductForOrder.map((product) => ({
          name: product.Product.name,
          numberOfProduct: product.numberOfproduct,
          price: product.ProductVariationValue?.price
            ? product.ProductVariationValue.price
            : product.Product.price,
          productId: product.Product.id,
          variationId: product.productVariationId
            ? product.productVariationId
            : undefined,
          variationValueId: product.productVariationValueId
            ? product.productVariationValueId
            : undefined,
          imageUrl: product.Product.imageUrls[0],
          variationValueName: product.ProductVariationValue?.name,
        }));

      setShoppingCartState((state: any) => ({
        ...state,
        orderitems: activeShoppingCart,
        price: activeOrderData.price,
        activeOrderId: activeOrderData.activeOrder.id,
      }));
    }
  }, [activeOrderData]);

  useEffect(() => {
    console.log(updateActiveOrderError?.data);
    if (
      JSON.parse(updateActiveOrderError?.message || JSON.stringify({ "": "" }))
        .need_login_now
    ) {
      setThemeStore({ openAuthModal: true });
    }
  }, [updateActiveOrderError]);

  useEffect(() => {
    if (updateActiveOrderData?.activeOrder) {
      const activeShoppingCart: ShoppingCart["orderitems"] =
        updateActiveOrderData.activeOrder.ProductForOrder.map((product) => ({
          name: product.Product.name,
          numberOfProduct: product.numberOfproduct,
          price: product.ProductVariationValue?.price
            ? product.ProductVariationValue.price
            : product.Product.price,
          productId: product.Product.id,
          variationId: product.productVariationId
            ? product.productVariationId
            : undefined,
          variationValueId: product.productVariationValueId
            ? product.productVariationValueId
            : undefined,
          imageUrl: product.Product.imageUrls[0],
          variationValueName: product.ProductVariationValue?.name,
        }));

      setShoppingCartState((state: any) => ({
        ...state,
        orderitems: activeShoppingCart,
        updateActiveOrder: false,
        price: updateActiveOrderData.price,
      }));
    }
  }, [updateActiveOrderData]);

  return (
    <div className="relative">
      <div
        onClick={() =>
          setShoppingCartState((state) => ({
            ...state,
            showCart: !state.showCart,
          }))
        }
        className="p-3 hover:bg-hover1 cursor-pointer rounded-[15px] relative"
      >
        {shoppingCartState?.orderitems?.length ? (
          <div className=" absolute top-0 right-0 ">
            <svg className="fill-green1 w-4 h-4 flex items justify-center animate-pulse">
              <circle r="3" cx="10" cy="10" className="" />
            </svg>
          </div>
        ) : null}
        <Shop_Cart classname=" " />
      </div>

      {process.browser
        ? createPortal(
            <AnimatePresence mode="wait">
              {shoppingCartState.showCart && (
                <motion.div
                  key="portal"
                  animate={{ opacity: 1, backdropFilter: "blur(2px)" }}
                  exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                  transition={{ duration: 0.3 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShoppingCartState((state) => ({
                      ...state,
                      showCart: false,
                    }));
                  }}
                  className="w-full h-full    flex items-center justify-center fixed left-0 right-0  top-0 bottom-0 "
                >
                  <div className="max-w-[1400px] w-full h-full relative">
                    <motion.div
                      variants={cartAnimation}
                      initial={{
                        opacity: 0,
                        translateY: -5,
                        translateX: -50,
                        height: 0,
                        scale: 0,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      exit={cartAnimation.closed}
                      animate={cartAnimation.open}
                      className="absolute border z-10  border-gray-100 flex gap-4 p-4 pt-8 items-center justify-evenly flex-col bg-white left-[20px] top-[60px]  rounded-[17px] shadow-sm w-[360px] h-[300px] shadow-neutral-200"
                    >
                      <div
                        onClick={() =>
                          setShoppingCartState((state) => ({
                            ...state,
                            showCart: false,
                          }))
                        }
                        className="absolute right-2 top-2 cursor-pointer hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
                      >
                        <XMark_Svg classname="w-[24px] h-[24px] fill-black1" />
                      </div>
                      {shoppingCartState?.orderitems?.length ? (
                        <>
                          <div className=" h-[250px]  overflow-y-scroll w-full gap-2 flex flex-col items-center ">
                            {shoppingCartState?.orderitems.map(
                              (prOrder, index) => (
                                <HeaderShoppingCartItem
                                  name={prOrder.name}
                                  key={index}
                                  price={prOrder.price}
                                  numberOfProduct={prOrder.numberOfProduct}
                                  imageUrl={prOrder.imageUrl || ""}
                                  variationValueName={
                                    prOrder.variationValueName
                                  }
                                  productId={prOrder.productId}
                                  setShoppingCartState={setShoppingCartState}
                                />
                              )
                            )}
                          </div>
                          <div className=" h-[50px]  flex flex-row justify-evenly w-full">
                            <div className="w-full items-center justify-center flex">
                              <span className="text-[10px]">جمع سبد خرید</span>
                            </div>
                            <Link
                              className="bg-green1 rounded-[10px] w-full items-center justify-center flex "
                              href={"/cart/checkout"}
                              onClick={() =>
                                setShoppingCartState((state) => ({
                                  ...state,
                                  showCart: false,
                                }))
                              }
                            >
                              <span className="text-center text-white">
                                مشاهده سبد خرید
                              </span>
                            </Link>
                          </div>
                        </>
                      ) : (
                        <motion.div
                          variants={{
                            closed: {
                              opacity: 0,
                              transition: { duration: 0.2 },
                            },
                            open: { opacity: 1, transition: { duration: 0.3 } },
                          }}
                          className="h-[200px]  flex flex-col  w-full items-center justify-evenly"
                        >
                          <Shopping_Cart_Empty classname="h-20 w-auto" />
                          <span className="text-[#979797]">
                            سبد خرید شما خالی است
                          </span>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>,
            // @ts-ignore
            document.body
          )
        : null}
    </div>
  );
}
