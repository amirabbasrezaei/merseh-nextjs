"use client";
import React, { useEffect, useState } from "react";
import Addresses from "./Address/Addresses";
import { trpc } from "@/utils/trpc";
import RadioInput from "../RadioInput";

import Image from "next/image";
import splitNumber from "../utils/splitNumber";
import Link from "next/link";
import Button from "../Button";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import useShoppingCart from "../useShoppingCart";
export default function Shipping() {
  const router = useRouter();
  const { activeOrderId, items, finalPrice } = useShoppingCart();
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [selectedShipping, setSelectedShipping] = useState<string | null>(null);
  const {
    mutate: mutateOrder,
    data: activeOrderData,
    isPending: isLoadingActiveOrderData,
  } = trpc.order.updateActiveOrder.useMutation({});
  const {
    data: shippingPricesData,
    mutate: mutateShippingPrices,
    isPending: isLoadingShippingPrices,
  } = trpc.shipping.shippingPrices.useMutation();

  const {
    mutate: mutateCreatePayment,
    data: createPaymentData,
    isPending: isCreatePaymentPending,
  } = trpc.payment.createPayment.useMutation();

  useEffect(() => {
    if (activeOrderId) {
      mutateShippingPrices({
        addressId: selectedAddress,
        orderId: activeOrderId,
      });
    }
  }, [selectedAddress]);

  useEffect(() => {
    if (selectedShipping) {
      mutateOrder({
        selectedProducts: items,
        shippingInfo: {
          shippingPartnerName: selectedShipping,
          addressId: selectedAddress
        },
      });
    }
  }, [selectedShipping, shippingPricesData]);

  useEffect(() => {
    if (createPaymentData?.pay_link) {
      router.push(createPaymentData.pay_link);
    }
    console.log(createPaymentData);
  }, [createPaymentData]);

  useEffect(() => {
    if (shippingPricesData?.shippings?.length) {
      setSelectedShipping(
        shippingPricesData?.shippings[0].shippingPartners[0].name
      );
    }
  }, [shippingPricesData]);



  return (
    <section className="flex flex-col sm:flex-row sm:p-10 gap-12 sm:gap-[200px]">
      <div className="sm:basis-7/12 flex flex-col gap-20">
        <Addresses
          selectedAddress={selectedAddress}
          setSelectedAddress={setSelectedAddress}
        />

        <div>
          <h2 className="text-[22px] text-black1 mb-4">حمل و نقل</h2>

          <div className="flex flex-col gap-6">
            <AnimatePresence presenceAffectsLayout mode="sync">
              {isLoadingShippingPrices || !selectedShipping
                ? Array.from(Array(3)).map((_, i) => (
                    <motion.div
                      key={String(i)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="animate-pulse bg-gray-100 w-full h-[60px] rounded-[8px]"
                    />
                  ))
                : shippingPricesData?.shippings?.length
                ? shippingPricesData?.shippings.map(
                    (shippingType, shippingTypeIndex) => (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={shippingTypeIndex}
                        className="flex flex-col gap-4"
                      >
                        <h3>{shippingType.shippingTypeName}</h3>
                        {shippingType.shippingPartners.map(
                          (shippingPartner: any) => (
                            <div
                              key={shippingPartner.shippingPartnerId}
                              onClick={() =>
                                setSelectedShipping(shippingPartner.name)
                              }
                              className="w-full cursor-pointer px-6 py-4 border h-[100px] border-[#EAEAEA] rounded-[8px] flex flex-row items-center justify-between"
                            >
                              <div className="flex flex-row gap-3 items-center">
                                <RadioInput
                                  isChecked={
                                    selectedShipping === shippingPartner.name
                                  }
                                />
                                <Image
                                  className=""
                                  src={shippingPartner.image}
                                  alt={shippingPartner.name}
                                  width={70}
                                  height={70}
                                />
                                <span className="text-black1 text-[13px]">
                                  {shippingPartner.title}
                                </span>
                              </div>
                              <span className="font-[500] text-green1 text-[20px] flex flex-row gap-1 items-center">
                                {splitNumber(shippingPartner.price)}
                                <span className="text-[12px] text-lightBlack">
                                  تومان
                                </span>
                              </span>
                            </div>
                          )
                        )}
                      </motion.div>
                    )
                  )
                : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <div className="sm:basis-3/12 h-full gap-4 flex flex-col items-center justify-center w-full ">
        <div className="w-full py-6 gap-5 border border-[#EAEAEA] rounded-[8px] flex flex-col items-center justify-center ">
          <div className="flex flex-col items-center justify-center gap-4 w-[80%]">
            <div className="flex flex-row gap-2 items-center justify-between w-full">
              <span className="text-lightBlack text-[15px] font-[500] w-full">
                جمع سبد خرید
              </span>
              {activeOrderData?.price ? (
                <span className="text-green1 font-[500] text-[18px] flex flex-row gap-1 items-center">
                  {splitNumber(finalPrice)}
                  <span className="text-[10px] text-black1 font-[400]">
                    تومان
                  </span>
                </span>
              ) : (
                <div className="h-8 animate-pulse rounded-md bg-gray-100 w-[50%]" />
              )}
            </div>
            <div className="flex flex-row gap-2 items-center justify-between w-full">
              <span className="text-lightBlack text-[15px] font-[500]">
                هزینه ارسال
              </span>
              {activeOrderData?.price ? (
                <span className="text-green1 font-[500] text-[18px] flex flex-row gap-1 items-center">
                  {splitNumber(activeOrderData.price?.shippingPrice)}
                  <span className="text-[10px] text-black1 font-[400]">
                    تومان
                  </span>
                </span>
              ) : (
                <div className="h-8 animate-pulse rounded-md bg-gray-100 w-[50%]" />
              )}
            </div>
          </div>
          <hr className="w-[80%]" />

          <div className="flex flex-row gap-2 items-center justify-between w-[80%]">
            <span className="text-lightBlack text-[15px] font-[500]">
              مبلغ نهایی
            </span>
            {activeOrderData?.price ? (
              <span className="text-green1 font-[500] text-[18px] flex flex-row gap-1 items-center">
                {splitNumber(activeOrderData.price?.finalPrice)}
                <span className="text-[10px] text-black1 font-[400]">
                  تومان
                </span>
              </span>
            ) : (
              <div className="h-8 animate-pulse rounded-md bg-gray-100 w-[50%]" />
            )}
          </div>
        </div>
        <Link className="w-full h-full" href={"/cart/shipping"}>
          <Button
            onClick={() =>
              activeOrderId && mutateCreatePayment({ orderId: activeOrderId })
            }
            isLoading={
              isCreatePaymentPending ||
              isLoadingShippingPrices ||
              isLoadingActiveOrderData
            }
            text="پرداخت"
            className="w-full"
          />
        </Link>
      </div>
    </section>
  );
}
