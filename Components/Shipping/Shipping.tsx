"use client";
import React, { useEffect, useState } from "react";
import Addresses from "./Address/Addresses";
import { trpc } from "@/utils/trpc";
import RadioInput from "../RadioInput";
import { useRecoilState } from "recoil";
import { shopingCartStateAtom } from "../Cart/HeaderShoppingCart";
import Image from "next/image";
import splitNumber from "../utils/splitNumber";
import Link from "next/link";
import Button from "../Button";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
export default function Shipping() {
  const router = useRouter();
  const [cartState] = useRecoilState(shopingCartStateAtom);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [selectedShipping, setSelectedShipping] = useState<{
    shippingTypeIndex: number;
    shippingPartnerId: number;
  }>({
    shippingTypeIndex: 0,
    shippingPartnerId: 1,
  });
  const {
    mutate: mutateOrder,
    data: activeOrderData,
    isPending: isPendingActiveOrderData,
  } = trpc.order.updateActiveOrder.useMutation({});
  const {
    data: shippingPricesData,
    mutate: mutateShippingPrices,
    isPending: isPendingShippingPrices,
  } = trpc.shipping.shippingPrices.useMutation();

  const {
    mutate: mutateCreatePayment,
    data: createPaymentData,
    isPending: isCreatePaymentPending,
  } = trpc.payment.createPayment.useMutation();

  useEffect(() => {
    if (cartState.activeOrderId) {
      mutateShippingPrices({
        addressId: selectedAddress,
        orderId: cartState.activeOrderId,
      });
    }
  }, [selectedAddress]);

  useEffect(() => {
    mutateOrder({
      selectedProducts: [],
      shippingInfo: {
        shippingPartnerId: selectedShipping.shippingPartnerId,
      },
    });
  }, [selectedShipping, shippingPricesData]);

  useEffect(() => {
    if (createPaymentData?.pay_link) {
      router.push(createPaymentData.pay_link);
    }
  }, [createPaymentData]);

  return (
    <section className="flex flex-row p-10 gap-[40px]">
      <div className="basis-9/12 flex flex-col gap-20">
        <Addresses
          selectedAddress={selectedAddress}
          setSelectedAddress={setSelectedAddress}
        />

        <div>
          <h2 className="text-[22px] text-black1 mb-4">حمل و نقل</h2>

          <div className="flex flex-col gap-6">
            <AnimatePresence presenceAffectsLayout mode="wait">
              {isPendingShippingPrices
                ? Array.from(Array(3)).map((_, i) => (
                    <motion.div
                      key={String(i)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="animate-pulse bg-gray-100 w-full h-[60px] rounded-[8px]"
                    />
                  ))
                : shippingPricesData?.result?.length
                ? shippingPricesData?.result.map(
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
                          (shippingPartner) => (
                            <div
                              key={shippingPartner.shippingPartnerId}
                              onClick={() =>
                                setSelectedShipping({
                                  shippingPartnerId:
                                    shippingPartner.shippingPartnerId,
                                  shippingTypeIndex: shippingTypeIndex,
                                })
                              }
                              className="w-full cursor-pointer px-6 py-4 border border-[#EAEAEA] rounded-[8px] flex flex-row items-center justify-between"
                            >
                              <div className="flex flex-row gap-3 items-center">
                                <RadioInput
                                  isChecked={
                                    selectedShipping.shippingPartnerId ===
                                    shippingPartner.shippingPartnerId
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
                                  ({shippingPartner.name})
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
      <div className="h-full gap-4 flex flex-col items-center justify-center w-full basis-3/12">
        <div className="w-full py-6 gap-5 border border-[#EAEAEA] rounded-[8px] flex flex-col items-center justify-center ">
          <div className="flex flex-col items-center justify-center gap-4 w-[80%]">
            <div className="flex flex-row gap-2 items-center justify-between w-full">
              <span className="text-lightBlack text-[15px] font-[500] w-full">
                جمع سبد خرید
              </span>
              {activeOrderData?.price ? (
                <span className="text-green1 font-[600] text-[18px] flex flex-row gap-1 items-center">
                  {splitNumber(cartState.price?.totalPrice)}
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
                <span className="text-green1 font-[600] text-[18px] flex flex-row gap-1 items-center">
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
              <span className="text-green1 font-[600] text-[18px] flex flex-row gap-1 items-center">
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
              cartState.activeOrderId &&
              mutateCreatePayment({ orderId: cartState.activeOrderId })
            }
            isLoading={
              isCreatePaymentPending ||
              isPendingShippingPrices ||
              isPendingActiveOrderData
            }
            text="پرداخت"
            className="w-full"
          />
        </Link>
      </div>
    </section>
  );
}
