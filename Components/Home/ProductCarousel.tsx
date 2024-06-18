import React, { useEffect, useRef, useState } from "react";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import Image from "next/image";
import { Chevron_Down_sharp_light } from "../SVGS";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import splitNumber from "../utils/splitNumber";

import "react-multi-carousel/lib/styles.css";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
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
export default function ProductCarousel({ title, sliderStartDelay }: props) {
  const sliderRef = useRef(null);
  // const [sliderIndex, setSliderIndex] = useState(0);
  // const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  // const [sliderRef, instanceRef] = useKeenSlider(
  //   {
  //     slideChanged() {},
  //     loop: true,
  //     slides: { spacing: 10, perView: 3 },
  //     renderMode: "performance",
  //     defaultAnimation: {},
  //     created(s) {
  //       setTimeout(() => {
  //         s.moveToIdx(1, true, animation);
  //       }, sliderStartDelay);
  //     },
  //     updated(s) {
  //       setTimeout(() => {
  //         s.moveToIdx(s.track.details.abs + 1, true, animation);
  //       }, sliderStartDelay);
  //     },
  //     animationEnded(s) {
  //       setTimeout(() => {
  //         s.moveToIdx(s.track.details.abs + 1, true, animation);
  //       }, sliderStartDelay);
  //     },
  //   },
  //   [
  //     // add plugins here
  //   ]
  // );
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [startScrollLeft, setStartScrollLeft] = useState<number>(0);

  // useEffect(() => {
  //   const func = () => {
  //     const sliderNodes = (sliderRef?.current as any).childNodes;
  //     if (sliderNodes?.length) {
  //       const lastElementBound = (
  //         sliderNodes[sliderNodes.length - 1] as HTMLElement
  //       ).getBoundingClientRect();

  //       if (lastElementBound.x > 0) {
  //         (sliderRef?.current as any).scrollTo({
  //           left: 0,
  //           behavior: "smooth",
  //         });
  //       } else {
  //         (sliderRef?.current as any).scrollTo({
  //           left:
  //             -(sliderNodes[0] as HTMLElement).clientWidth +
  //             (sliderRef?.current as any).scrollLeft -
  //             16,
  //           behavior: "smooth",
  //         });
  //       }
  //     }
  //     setTimeout(() => {
  //       func();
  //     }, 10000);
  //   };
  //   func();
  // }, []);
  const { data: productCarouselData, isLoading } =
    trpc.product.productCarousel.useQuery();
  // useEffect(() => {
  //   console.log(drag);
  //   (sliderRef.current as any).onmouseover = (e: any) => {
  //     if (sliderRef.current && drag !== 0) {
  //       // console.log(e.clientX - drag);
  //     }
  //   };
  // }, [drag]);

  return (
    <section className="w-full  flex flex-col items-center gap-5 ">
      <span className="text-[25px] text-black1 font-normal">{title}</span>
      <div className="flex flex-row justify-center items-center h-full w-full">
        {/* <div
          onClick={() => {
            const sliderNodes = (sliderRef?.current as any).childNodes;
            (sliderRef?.current as any).scrollTo({
              left:
                -(sliderNodes[0] as HTMLElement).clientWidth +
                (sliderRef?.current as any).scrollLeft -
                16,
              behavior: "smooth",
            });
          }}
          className="basis-1/12 h-full w-12 hidden sm:flex justify-center items-center "
        >
          <Chevron_Down_sharp_light classname="rotate-[-90deg] w-6 fill-[#CCCCCC]" />
        </div>
        <div
          id="sliderContainer"
          ref={sliderRef}
          onDragStart={(e) => {
            setIsDragging(true);
            setStartX(e.pageX);
            setStartScrollLeft(e.currentTarget.scrollLeft);
          }}
          onDragEnd={(e) => {
            setIsDragging(false);
          }}
          onDrag={(e) => {
            if (!isDragging) return;
            const newScrollLeft = startScrollLeft - (e.pageX - startX);
            if (newScrollLeft < 0) {
              e.currentTarget.scrollLeft = newScrollLeft;
            }
          }}
          style={{ scrollbarWidth: "none", scrollSnapType: "none" }}
          className="sm:basis-10/12 overflow-x-scroll  gap-4  flex flex-row w-full "
        >
          {productCarouselData?.products.length
            ? productCarouselData.products.map((product, index) => (
                <motion.div
                  key={product.id}
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
              ))
            : null}
        </div>
        <div
          onClick={() => {
            const sliderNodes = (sliderRef?.current as any).childNodes;
            (sliderRef?.current as any).scrollTo({
              left:
                (sliderNodes[0] as HTMLElement).clientWidth +
                (sliderRef?.current as any).scrollLeft -
                16,
              behavior: "smooth",
            });
          }}
          className="basis-1/12 h-full w-12 hidden sm:flex justify-center items-center"
        >
          <Chevron_Down_sharp_light classname="rotate-[90deg] w-6  fill-[#CCCCCC]" />
        </div> */}

        <Swiper
          spaceBetween={50}
          slidesPerView={5}
          onSlideChange={() => console.log("slide change")}
          onSwiper={(swiper) => console.log(swiper)}
        >
          {productCarouselData?.products.length
            ? productCarouselData.products.map((product, index) => (
                <SwiperSlide>
                  <motion.div
                    key={product.id}
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
        </Swiper>
        <div
          onClick={() => {

          }}
          className="basis-1/12 h-full w-12 hidden sm:flex justify-center items-center"
        >
          <Chevron_Down_sharp_light classname="rotate-[90deg] w-6  fill-[#CCCCCC]" />
        </div>
      </div>
    </section>
  );
}
