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
import {
  Merseh_nastaliq,
  MersehSvg,
  MersehSvg_no_color,
  Shop_Cart,
  Shopping_Cart_Empty,
} from "@/Components/SVGS";

interface Props {
  products: CallToActionProductType[];
}

const parentAnimation = {
  open: {
    opacity: 1,

    height: "fit-content",
    transition: {
      duration: 0.2,

      staggerChildren: 0.1,
    },
  },
  close: { opacity: 0,  height: 0 },
};

const childAnimation = {
  open: { scale: 1, opacity: 1, translateY: 0, transition: { duration: 0.3 } },
  close: {
    scale: 0.4,
    opacity: 0,
    translateY: 50,
    transition: { duration: 0.2 },
  },
};

export default function CallToActionProducts({ products }: Props) {
  const [showPostOptions, setShowPostOptions] = useState(false);
  const [swiperRef] = useState();
  const { width } = useWindowSize();

  return (
    <div className="flex flex-col relative w-full items-center justify-center h-fit    rounded-lg">
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
          autoplay={{ delay: 5000, disableOnInteraction: false }}
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
      <div className="  flex items-center justify-start w-full mr-10 mt-5">
        <Merseh_nastaliq classname="w-[40px] fill-[#414141]" />
      </div>
      <motion.div
        variants={parentAnimation}
        animate={showPostOptions ? "open" : "close"}
        initial={false}
        className="flex flex-col w-full gap-5 mt-5"
      >
        <motion.div
          className="bg-gray-100 h-14 rounded-md flex justify-center items-center"
          variants={childAnimation}
        >
          <span className="font-[500]">کالا به سبد خرید شما اضافه شد</span>
        </motion.div>
        <div className="flex flex-col md:flex-row justify-evenly items-center w-full gap-4">
        <Link className="w-full" href={`/cart/checkout`}>
            <motion.div
              className="bg-green2 text-white px-4 py-2 rounded-lg w-full flex flex-row gap-3 justify-center items-center"
              variants={childAnimation}
            >
              <span className="font-[400]">مشاهده سبد خرید</span>
              <Shop_Cart classname="w-7 fill-white" />
            </motion.div>
          </Link>
          <Link className="w-full" href={`/`}>
            <motion.div
              className="bg-[#006CD0] text-white px-4 py-2 rounded-lg w-full flex flex-row gap-3  justify-center items-center"
              variants={childAnimation}
            >
              <span className="font-[400]">ورود به فروشگاه مرسه</span>
              <MersehSvg_no_color classname="w-6 fill-white" />
            </motion.div>
          </Link>
      
        </div>
      </motion.div>
    </div>
  );
}
