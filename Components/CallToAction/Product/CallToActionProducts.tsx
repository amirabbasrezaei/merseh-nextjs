"use client";
import React, { useState } from "react";
import CallToActionProduct, {
  CallToActionProductType,
} from "./CallToActionProduct";
import { delay, motion } from "framer-motion";
import Link from "next/link";
interface Props {
  products: CallToActionProductType[];
}

const parentAnimation = {
  open: {
    opacity: 1,
    translateY: 0,
    transition: {
      duration: 0.3,

      staggerChildren: 0.1,
    },
  },
  close: { opacity: 0, translateY: 150 },
};

const childAnimation = {
  open: { scale: 1, opacity: 1, translateY: 0, transition: { duration: 0.3 } },
  close: {
    scale: 0,
    opacity: 0.4,
    translateY: 150,
    transition: { duration: 0.3 },
  },
};

export default function CallToActionProducts({ products }: Props) {
  const [showPostOptions, setShowPostOptions] = useState(false);
  return (
    <div className="flex flex-col w-full items-center justify-center">
      <div className="w-fit h-fit shadow-[inset_0px_0px_6px_0px_#00000047] bg-[#00C086] my-7  flex justify-evenly p-7  gap-[40px] items-center rounded-[18px]">
        {products.map((pr) => (
          <CallToActionProduct
            setShowPostOptions={setShowPostOptions}
            key={
              pr?.variation_value_id && pr?.variationId
                ? `${pr.variationId}_${pr.variation_value_id}`
                : pr.product_id
            }
            imageurl={pr.imageurl}
            price={pr.price}
            product_id={pr.product_id}
            product_name={pr.product_name}
          />
        ))}
      </div>
      <motion.div
        variants={parentAnimation}
        animate={showPostOptions ? "open" : "close"}
        initial={false}
        className="flex flex-col w-[60%] gap-5"
      >
        <motion.div
          className="bg-gray-100 h-14 rounded-md flex justify-center items-center"
          variants={childAnimation}
        >
          <span className="font-[500]">کالا به سبد خرید شما اضافه شد</span>
        </motion.div>
        <div className="flex flex-row justify-evenly items-center">
          <Link href={`/`}>
            <motion.div
              className="bg-[#006CD0] text-white px-3 py-1 rounded-lg"
              variants={childAnimation}
            >
              <span>ورود به فروشگاه مرسه</span>
            </motion.div>
          </Link>
          <Link href={`/cart/checkout`}>
            <motion.div
              className="bg-green2 text-white px-3 py-1 rounded-lg"
              variants={childAnimation}
            >
              <span>مشاهده سبد خرید</span>
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
