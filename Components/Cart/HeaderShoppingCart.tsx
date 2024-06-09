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
import { userInfoStoreAtom } from "../UserAuth";
import { browser } from "process";
import splitNumber from "../utils/splitNumber";
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
      // console.log(oldValue, oldValue);
      if (newValue.orderitems.length > oldValue.orderitems.length) {
        const newPrOrder = newValue.orderitems.at(-1);
        const findIndex_On_Variation = oldValue.orderitems.findIndex(
          (e) => e.variationValueId === newPrOrder?.variationValueId
        );
        const findIndex_On_Product = oldValue.orderitems.findIndex(
          (e) => e.productId === newPrOrder?.productId
        );

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
          localStorage.setItem("shopCart", JSON.stringify(result));
          setSelf(result);
          return;
        } else {
          const result = { ...newValue, updateActiveOrder: true };
          localStorage.setItem("shopCart", JSON.stringify(result));
          setSelf(result);

          return;
        }
      } else if (newValue.orderitems.length < oldValue.orderitems.length) {
        localStorage.setItem("shopCart", JSON.stringify(newValue));
        setSelf({ ...newValue, updateActiveOrder: true });
        return;
      } else {
        localStorage.setItem("shopCart", JSON.stringify(newValue));
        setSelf({ ...newValue, updateActiveOrder: false });
      }
    });
  };
}

let local_storage: string = JSON.stringify({
  orderitems: [],
  showCart: false,
  updateActiveOrder: false,
});

if (browser) {
  local_storage = localStorage.getItem("shopCart") || local_storage;
}

export const shopingCartStateAtom = atom<ShoppingCart>({
  key: "ShopingCart",
  default:
    typeof localStorage !== undefined
      ? // @ts-ignore
        JSON.parse(local_storage)
        ? JSON.parse(local_storage)
        : { orderitems: [], showCart: false, updateActiveOrder: false }
      : { orderitems: [], showCart: false, updateActiveOrder: false },
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
  },
  open: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2, damping: 0 },

    translateY: 0,
    height: 300,
    scale: 1,
    translateX: 0,
  },
};

export default function HeaderShoppingCart() {
  const [themeStore, setThemeStore] = useRecoilState(themeRecoilStateAtom);
  const [userInfo, setUserInfo] = useRecoilState(userInfoStoreAtom);
  const {
    data: activeOrderData,
    error,
    refetch,
  } = trpc.order.getActiveOrder.useQuery(undefined, {
    retry: false,
  });
  const {
    error: updateActiveOrderError,
    mutate: mutateActiveOrder,
    data: updateActiveOrderData,
  } = trpc.order.updateActiveOrder.useMutation({ retry: 2 });

  const [shoppingCartState, setShoppingCartState] =
    useRecoilState(shopingCartStateAtom);

  useEffect(() => {
    refetch().then(() => {
      if (userInfo && shoppingCartState.updateActiveOrder) {
        mutateActiveOrder({
          selectedProducts: JSON.parse(localStorage.getItem("shopCart") || "{}")
            .orderitems as ShoppingCart["orderitems"],
        });
      }
    });
  }, [shoppingCartState, userInfo]);

  useEffect(() => {
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
    if (
      JSON.parse(updateActiveOrderError?.message || JSON.stringify({ "": "" }))
        .need_login_now
    ) {
      setThemeStore({ openAuthModal: true });
    }
  }, [updateActiveOrderError]);

  useEffect(() => {
    // console.log(updateActiveOrderData);
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
    <div className="relative hidden sm:flex">
      <div
        onClick={() =>
          setShoppingCartState((state) => ({
            ...state,
            showCart: !state.showCart,
          }))
        }
        className=" hover:bg-hover1 hover:fill-green1 cursor-pointer rounded-[15px] relative"
      >
        {shoppingCartState?.orderitems?.length ? (
          <div className=" absolute top-0 right-0 ">
            <svg className="fill-green1 w-4 h-4 flex items justify-center animate-pulse">
              <circle r="3" cx="10" cy="10" className="" />
            </svg>
          </div>
        ) : null}
        <Shop_Cart classname="hover:fill-inherit fill-[#363636] w-[53px] p-3" />
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
                  className="w-full h-full z-20   flex items-center justify-center fixed left-0 right-0  top-0 bottom-0 "
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
                      className="absolute border w-[300px] z-10 origin-top-right border-gray-100 flex gap-4 p-4 pt-8 items-center justify-evenly flex-col bg-white right-[20px] top-[60px]  rounded-[17px] shadow-sm  h-[300px] shadow-neutral-200"
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
                          <div className=" h-[50px]  flex flex-row justify-evenly w-full gap-5">
                            <div className="w-full items-center justify-evenly flex ">
                              {shoppingCartState.price?.totalPrice ? (
                                <>
                                  <span className="text-[12px] text-lightBlack">
                                    جمع سبد خرید
                                  </span>
                                  <span className="text-green1 text-[16px]">
                                    {splitNumber(
                                      shoppingCartState.price?.totalPrice
                                    )}
                                  </span>
                                </>
                              ) : null}
                            </div>
                            <Link
                              href={"/cart/checkout"}
                              className="bg-green1 cursor-pointer rounded-[10px] w-full items-center justify-center flex "
                              onClick={() => {
                                setShoppingCartState((state) => ({
                                  ...state,
                                  showCart: false,
                                }));
                              }}
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
