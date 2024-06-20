import React, { useEffect, useRef, useState } from "react";
import "keen-slider/keen-slider.min.css";

import Image from "next/image";
import { Chevron_Down_sharp_light } from "../SVGS";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import splitNumber from "../utils/splitNumber";
import { Autoplay, Virtual } from "swiper/modules";
import "react-multi-carousel/lib/styles.css";
import { motion } from "framer-motion";
import {
  Swiper,
  SwiperClass,
  SwiperRef,
  SwiperSlide,
  useSwiper,
} from "swiper/react";

// Import Swiper styles
import "swiper/css";
import useWindowSize from "../useWindowSize";

interface props {
  title: string;
  sliderStartDelay: number;
}

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3,
    slidesToSlide: 3, // optional, default to 1.
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
    slidesToSlide: 2, // optional, default to 1.
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
    slidesToSlide: 1, // optional, default to 1.
  },
};
const animation = { duration: 1000, easing: (t: any) => t };

export function SlideNextButton() {
  const swiper = useSwiper();

  return (
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
  );
}

export function SlidePrevButton() {
  const swiper = useSwiper();

  return (
    <div className=" absolute z-20 top-0 right-0  h-full  w-12 hidden sm:flex justify-center items-center ">
      <div
        onClick={() => swiper.slidePrev()}
        className="w-10 cursor-pointer h-10 flex items-center justify-center bg-white border border-[#dfdfdf] rounded-full "
      >
        <Chevron_Down_sharp_light classname="rotate-[-90deg] w-6 fill-[#b8b8b8]" />
      </div>
    </div>
  );
}

export default function ProductCarousel({ title, sliderStartDelay }: props) {
  const [swiperRef, setSwiperRef] = useState();
  const { width } = useWindowSize();
  const { data: productCarouselData, isLoading } =
    trpc.product.productCarousel.useQuery();

  return (
    <section className="w-full  flex flex-col items-center gap-5 ">
      <span className="text-[25px] text-black1 font-normal">{title}</span>
      <Swiper
        onSwiper={swiperRef}
        spaceBetween={50}
        slidesPerView={width > 639 ? 5 : 2}
        direction="horizontal"
        className="w-full h-full "
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        modules={[Autoplay]}
      >
        <SlidePrevButton />

        {productCarouselData?.products.length
          ? productCarouselData.products.map((product, index) => (
              <SwiperSlide key={product.id}>
                <motion.div
                  transition={{ duration: 0.3 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center  w-full"
                  onDrag={(e) => e.preventDefault()}
                >
                  <Link
                    // style={{ pointerEvents: "none" }}
                    // aria-disabled={drag !== 0 ? "true" : "false"}
                    href={`/product/${product.id}`}
                    className="border pb-4  sm:px-5 h-full w-[160px] justify-between  gap-3 flex flex-col  items-center sm:justify-center relative   border-[#EDEDED] rounded-[12px]  "
                  >
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      {product?.imageNames.length ? (
                        <Image
                          onSelectCapture={() => {
                            return false;
                          }}
                          onCopy={() => {
                            return false;
                          }}
                          className="sm:w-full w-auto h-full rounded-[12px] sm:h-auto basis-1/4"
                          style={{ objectFit: "contain" }}
                          src={`${process.env.NEXT_PUBLIC_STATIC_FILES_ENDPOINT}/productImages/${product.imageNames[0]}`}
                          alt={product.imageNames[0].split(".").at(0) || ""}
                          quality={100}
                          width={160}
                          placeholder="blur"
                          height={160}
                          blurDataURL="data:image/webp;base64,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"
                        />
                      ) : null}
                      <span className="font-[400] basis-2/4 text-[14px] sm:text-[14px] text-black1 w-fit">
                        {product.name}
                      </span>
                    </div>
                    <span className="font-normal text-nowrap text-[14px] sm:text-[16px] basis-1/4 text-green1 w-fit">
                      {splitNumber(product.price)}{" "}
                      <span className="text-[11px]">تومان</span>
                    </span>
                  </Link>
                </motion.div>
              </SwiperSlide>
            ))
          : null}

        <SlideNextButton />
      </Swiper>
    </section>
  );
}
