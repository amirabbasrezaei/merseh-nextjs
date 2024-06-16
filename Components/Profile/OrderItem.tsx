import { ordersController } from "@/server/Controllers/order.controller";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Chevron_Down, Chevron_Down_sharp_light } from "../SVGS";
interface Props {
  orderId: number;
  orderStatus: string;
  orderProducts: any;

  address: {
    title?: string;
    postalCode?: string;
    city: string;
    province: string;
    recieverName: string;
    recieverFamilyName: string;
  };
}

export default function OrderItem({
  orderStatus,
  orderId,
  orderProducts,
  address,
}: Props) {
  const [showOrderTail, setShowOrderTail] = useState(false);
  console.log(address);
  return (
    <motion.div
      layout
      initial={false}
      variants={{
        open: { transition: { delayChildren: 0.3 } },
        hidden: {},
      }}
      animate={showOrderTail ? "open" : "hidden"}
      className="border w-full h-fit gap-5 flex flex-col border-[#e3e3e3] rounded-[8px] p-4"
    >
      <motion.div
        layout
        className="flex flex-row  w-full justify-between items-center"
      >
        <div className="flex flex-row gap-1 items-center ">
          <span className="font-[400] text-[13px]  sm:text-[15px] text-nowrap">
            شماره سفارش:
          </span>
          <span className="font-[400] text-[13px]  sm:text-[15px] text-nowrap text-center">
            {orderId}
          </span>
        </div>
        <div className="flex flex-row gap-1 ">
          <span className="text-[13px]  sm:text-[15px] text-nowrap">
            وضعیت:
          </span>
          <span className="font-[500] text-green2 text-[13px]  sm:text-[15px] text-nowrap">
            {orderStatus === "ACTIVE"
              ? "فعال"
              : orderStatus === "DELIVERED"
              ? "ارسال شده"
              : orderStatus === "PAYED"
              ? "پرداخت شده"
              : orderStatus === "DELIVERING"
              ? "در  حال ارسال"
              : null}
          </span>
        </div>
      </motion.div>
      <motion.div layout className="flex flex-col gap-3">
        <h4 className="text-[#383838] text-[17px] font-[500]">محصولات</h4>
        <div
          style={{ scrollbarWidth: "none" }}
          className="flex flex-row  overflow-x-scroll gap-4"
        >
          {orderProducts.length
            ? orderProducts.map((pr: any, i: number) => (
                <Link
                  href={`/product/${pr.Product.id}`}
                  className="flex flex-col items-center border border-[#e9e9e9] rounded-[10px] p-5"
                  key={i}
                >
                  <Image
                    width={100}
                    height={100}
                    alt={
                      pr.Product.imageUrl.split("/").at(-1)?.split(".")[0] || ""
                    }
                    src={pr.Product.imageUrl}
                  />
                  <span className="text-[13px] text-black1  sm:text-[15px] text-nowrap">
                    {`${pr.Product.name}${
                      pr?.ProductVariationValue?.name
                        ? "-" + pr.ProductVariationValue.name
                        : ""
                    }`}
                  </span>
                </Link>
              ))
            : null}
        </div>
      </motion.div>
      <motion.div
        layout
        initial={false}
        variants={{
          open: {
            y: 0,
            transition: { duration: 0.3 },
            height: "fit-content",
            opacity: 1,
          },
          hidden: {
            y: 40,
            height: 0,
            opacity: 0,
            transition: { duration: 0.3 },
          },
        }}
        className="flex flex-col w-full gap-3"
      >
        <h4 className="text-[#383838] text-[17px] font-[500]">اطلاعات ارسال</h4>
        {address.title?.length ? (
          <div className="flex flex-row gap-1">
            <span className="text-[#3f3f3f] text-[14px] sm:text-[15px]">
              عنوان آدرس:
            </span>

            <span className="text-black1 text-[14px] sm:text-[15px]">
              {address.title}
            </span>
          </div>
        ) : null}
        <div className="flex flex-row gap-1">
          <span className="text-[#3f3f3f] text-[14px] sm:text-[15px]">
            استان:
          </span>

          <span className="text-black1 text-[14px] sm:text-[15px]">
            {address.province}
          </span>
        </div>
        <div className="flex flex-row gap-1">
          <span className="text-[#3f3f3f] text-[14px] sm:text-[15px]">
            شهر:
          </span>

          <span className="text-black1 text-[14px] sm:text-[15px]">
            {address.city}
          </span>
        </div>
        <div className="flex flex-row gap-1">
          <span className="text-[#3f3f3f] text-[14px] sm:text-[15px]">
            کد پستی:
          </span>

          <span className="text-black1 text-[14px] sm:text-[15px]">
            {address.postalCode}
          </span>
        </div>
        <div className="flex flex-row gap-1">
          <span className="text-[#3f3f3f] text-[14px] sm:text-[15px]">
            تحویل گیرنده:
          </span>

          <span className="text-black1 text-[14px] sm:text-[15px]">
            {`${address.recieverName} ${address.recieverFamilyName}`}
          </span>
        </div>
      </motion.div>

      {orderStatus !== "ACTIVE" ? (
        <motion.div
          layout
          onClick={() => setShowOrderTail((state) => !state)}
          className="w-full flex items-center justify-center  mt-5 "
        >
          <div className="w-fit h-full z-10 px-4 py-2 items-center justify-center flex flex-row gap-1 sm:hover:bg-hover1 rounded-[10px] cursor-pointer">
            <span>{`مشاهده ${showOrderTail ? "کمتر" : "بیشتر"}`}</span>
            <motion.div
              initial={false}
              transition={{
                duration: 0.2,
                type: "spring",
                bounce: 10,
                damping: 15,
              }}
              animate={{ rotate: showOrderTail ? 180 : 0 }}
            >
              <Chevron_Down_sharp_light classname="w-4 h-auto fill-lightBlack" />
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </motion.div>
  );
}
