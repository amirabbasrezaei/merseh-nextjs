"use client";
import React, { useState } from "react";
import CallToActionProduct, {
  CallToActionProductType,
} from "./CallToActionProduct";
import { delay, motion } from "framer-motion";
import Link from "next/link";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import "swiper/css";
import useWindowSize from "../../useWindowSize";
import { Autoplay } from "swiper/modules";
import { Merseh_nastaliq } from "@/Components/SVGS";

interface Props {
  products: CallToActionProductType[];
}

const parentAnimation = {
  open: {
    opacity: 1,
    translateY: 0,
    height: "fit-content",
    transition: {
      duration: 0.3,

      staggerChildren: 0.1,
    },
  },
  close: { opacity: 0, translateY: 150, height: 0 },
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
  const [swiperRef] = useState();
  const { width } = useWindowSize();

  return (
    <div className="flex flex-col relative w-full items-center justify-center h-fit gap-5  p-5 rounded-lg">
      <div className="  flex items-center justify-center w-full ">
        <Merseh_nastaliq classname="w-[50px] fill-[#414141]" />
      </div>
      <div className="relative w-full">
        <Swiper
          onSwiper={swiperRef}
          spaceBetween={40}
          slidesPerView={width > 639 ? 3 : 1}
          direction="horizontal"
          className=" bg-inherit rounded-[18px]  h-fit w-full shadow-[inset_0px_0px_6px_0px_#00000047]    flex justify-evenly p-7  gap-[40px] items-center "
          style={{
            background: "#00C086",
            height: "fit-content",
            width: "100%",
            padding: 20,
            // paddingTop: 60,
          }}
          autoplay={{ delay: 20000, disableOnInteraction: false }}
          modules={[Autoplay]}
        >
          {/* <SlidePrevButton /> */}
          {products.map((pr) => (
            <SwiperSlide
              style={{
                display: "flex",
                justifyContent: "center",
                justifyItems: "center",
              }}
              className="w-full h-full flex items-center justify-center  rounded-[18px]"
              key={
                pr?.variation_value_id && pr?.variationId
                  ? `${pr.variationId}_${pr.variation_value_id}`
                  : pr.product_id
              }
            >
              <CallToActionProduct
                setShowPostOptions={setShowPostOptions}
                imageurl={pr.imageurl}
                price={pr.price}
                product_id={pr.product_id}
                product_name={pr.product_name}
              />
            </SwiperSlide>
          ))}

          {/* <SlideNextButton /> */}
        </Swiper>
      </div>
      <motion.div
        variants={parentAnimation}
        animate={showPostOptions ? "open" : "close"}
        initial={false}
        className="flex flex-col w-full gap-5 "
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
              className="bg-[#006CD0] text-white px-4 py-2 rounded-lg"
              variants={childAnimation}
            >
              <span className="font-[400]">ورود به فروشگاه مرسه</span>
            </motion.div>
          </Link>
          <Link href={`/cart/checkout`}>
            <motion.div
              className="bg-green2 text-white px-4 py-2 rounded-lg"
              variants={childAnimation}
            >
              <span className="font-[400]">مشاهده سبد خرید</span>
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
