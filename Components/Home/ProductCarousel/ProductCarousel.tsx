import React, { useState } from "react";
import "keen-slider/keen-slider.min.css";
import { Chevron_Down_sharp_light } from "../../SVGS";
import { trpc } from "@/utils/trpc";
import { Autoplay } from "swiper/modules";
import "react-multi-carousel/lib/styles.css";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import "swiper/css";
import useWindowSize from "../../useWindowSize";
import ProductCarouselItem from "./ProductCarouselItem";

interface props {
  title: string;
  sliderStartDelay: number;
}

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
    <>
      {swiper.activeIndex !== 0 ? (
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

export default function ProductCarousel({ title, sliderStartDelay }: props) {
  const [swiperRef] = useState();
  const { width } = useWindowSize();
  const { data: productCarouselData } = trpc.product.productCarousel.useQuery();

  return (
    <section className="w-full  flex flex-col items-center gap-10 ">
      <div className="flex flex-row gap-1 items-center justify-center ">
        <svg
          className="w-[9px] h-auto"
          viewBox="0 0 11 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse cx="5.5" cy="11" rx="5.5" ry="11" fill="#00A573" />
        </svg>
        <span className="text-[18px] font-[600] text-gray-600  w-full ">
          {title}
        </span>
      </div>
      <Swiper
        onSwiper={swiperRef}
        spaceBetween={10}
        slidesPerView={width > 639 ? 5 : 1}
        direction="horizontal"
        className="w-full h-full "
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        modules={[Autoplay]}
      >
        <SlidePrevButton />

        {productCarouselData?.products.length
          ? productCarouselData.products.map((product) => (
              <SwiperSlide className="w-fit h-full " key={product.id}>
                <ProductCarouselItem
                  id={product.id}
                  imageUrl={`${process.env.NEXT_PUBLIC_STATIC_FILES_ENDPOINT}/productImages/${product.imageNames[0]}`}
                  name={product.name}
                  price={product.price}
                />
              </SwiperSlide>
            ))
          : null}

        <SlideNextButton />
      </Swiper>
    </section>
  );
}
