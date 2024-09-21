import React, { useEffect, useState } from "react";
import "keen-slider/keen-slider.min.css";

import { Chevron_Down_sharp_light, Shape1_SVG } from "../../SVGS";
import { trpc } from "@/utils/trpc";
import { Autoplay } from "swiper/modules";
import "react-multi-carousel/lib/styles.css";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";

import "swiper/css";
import useWindowSize from "../../useWindowSize";
import { Product } from "@prisma/client";
import ProductGridItem from "./ProductGridItem";

interface props {
  title: string;
  categoryId: number;
}

export function SlideNextButton() {
  const swiper = useSwiper();

  return (
    <>
      {!swiper.isEnd ? (
        <div className=" absolute top-0 left-0 z-20  h-full w-12 hidden sm:flex justify-center items-center">
          <div
            onClick={() => {
              swiper.slideNext();
            }}
            className="w-10 h-10 cursor-pointer flex items-center justify-center bg-white border border-[#dfdfdf] rounded-full "
          >
            <Chevron_Down_sharp_light classname="rotate-[90deg] w-6 fill-[#CCCCCC]" />
          </div>
        </div>
      ) : null}
    </>
  );
}

export function SlidePrevButton() {
  const swiper = useSwiper();

  return (
    <>
      {!swiper.isBeginning ? (
        <div className=" absolute z-20 top-0 right-0  h-full  w-12 hidden sm:flex justify-center items-center ">
          <div
            onClick={() => swiper.slidePrev()}
            className="w-10 cursor-pointer h-10 flex items-center justify-center bg-white border border-[#dfdfdf] rounded-full "
          >
            <Chevron_Down_sharp_light classname="rotate-[-90deg] w-6 fill-[#b8b8b8]" />
          </div>
        </div>
      ) : null}
    </>
  );
}

const prepareProductsForGridView = (products: any) => {
  const productArray: any = [];
  products.map((product: any, index: number) => {
    const fixedDivide = (index / 3).toFixed(1).split(".")[0];
    const mod = index % 3;

    if (!mod) {
      productArray.push([]);
    }

    productArray[Number(fixedDivide)].push(product);
  });

  return productArray;
};

export default function ProductsGrid({ title, categoryId }: props) {
  const [swiperRef, setSwiperRef] = useState();
  const { width } = useWindowSize();
  const { data, mutate } = trpc.filter.filterProduct.useMutation();

  useEffect(() => {
    mutate({ categoryId });
  }, []);

  return (
    <section className="w-full sm:p-4 flex flex-col items-center gap-6 ">
      <div className="flex flex-row gap-1 items-center justify-center relative w-full">
        {/* <hr className="border-[#0296bb] w-full absolute  " /> */}
        {/* <svg
          className="w-[9px] h-auto"
          viewBox="0 0 11 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse cx="5.5" cy="11" rx="5.5" ry="11" fill="#00A573" />
        </svg> */}
        <Shape1_SVG classname="fill-[#007694] mb-1 absolute rotate-[-8deg] w-[170px] " />
        <span className="text-[20px] font-[600] text-white  z-10">
          {title}
        </span>
      </div>
      <Swiper
        onSwiper={swiperRef}
        spaceBetween={0}
        style={width > 639 ? { paddingRight: 20, paddingLeft: 20 } : {}}
        slidesPerView={width > 1023 ? 3 : width > 767 ? 2 : 1}
        direction="horizontal"
        className="w-full h-full  border-[#f3f3f3] rounded-[5px]"
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        modules={[Autoplay]}
      >
        {/* <SlidePrevButton /> */}

        {data?.products?.length
          ? prepareProductsForGridView(data.products).map(
              (productSlice: any, index: any) => {
                return productSlice.length >= 3 ? (
                  <SwiperSlide key={index}>
                    <div
                      key={index}
                      className="flex flex-row w-full gap-0 h-fit"
                    >
                      <ProductGridItem productSlice={productSlice} />
                      {productSlice.length !== index + 1 ? (
                        <div className="md:border-l border-[#e6e6e6]  w-[1x]" />
                      ) : null}
                    </div>
                  </SwiperSlide>
                ) : null;
              }
            )
          : Array.from(Array(3)).map((_, index) => (
              <SwiperSlide key={index}>
                <div className="flex flex-col gap-3">
                  {Array.from(Array(3)).map((_, i) => (
                    <div
                      key={i}
                      className="flex flex-row gap-3  justify-between rounded-[5px] p-3 items-center"
                    >
                      <div className="flex flex-row gap-4 items-center">
                        <div className="w-[120px] h-[120px] bg-gray-100 animate-pulse rounded-[5px]"></div>
                        <div className="w-[100px] h-5 bg-gray-100 animate-pulse rounded-[5px]"></div>
                      </div>
                      <div className="w-[60px] h-5 bg-gray-100 animate-pulse rounded-[5px]"></div>
                    </div>
                  ))}
                </div>
              </SwiperSlide>
            ))}

        {/* <SlideNextButton /> */}
      </Swiper>
    </section>
  );
}
