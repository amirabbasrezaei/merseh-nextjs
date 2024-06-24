import React, { useEffect, useState } from "react";
import "keen-slider/keen-slider.min.css";

import Image from "next/image";
import { Chevron_Down_sharp_light } from "../SVGS";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import splitNumber from "../utils/splitNumber";
import { Autoplay } from "swiper/modules";
import "react-multi-carousel/lib/styles.css";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";

import "swiper/css";
import useWindowSize from "../useWindowSize";
import { Product } from "@prisma/client";

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

  useEffect(() => {
    data?.length && prepareProductsForGridView(data);
    data && console.log(data[4]);
  }, [data]);

  return (
    <section className="w-full sm:p-4 flex flex-col items-center gap-5 ">
      <h3 className="text-[20px] text-black1 font-normal w-full ">{title}</h3>
      <Swiper
        onSwiper={swiperRef}
        spaceBetween={10}
        slidesPerView={width > 639 ? 3 : 1}
        direction="horizontal"
        className="w-full h-full "
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        modules={[Autoplay]}
      >
        <SlidePrevButton />

        {data?.length
          ? prepareProductsForGridView(data).map(
              (productSlice: any, index: any) => {
                return productSlice.length >= 3 ? (
                  <SwiperSlide key={index}>
                    <motion.div
                      className="flex flex-col gap-3 h-full"
                      variants={{
                        open: {
                          transition: {
                            type: "spring",
                            staggerChildren: 0.3,
                          },
                          opacity: 1,
                        },
                        close: { opacity: 0 },
                      }}
                      initial="close"
                      animate={"open"}
                    >
                      {productSlice.map((product: any) => (
                        <Link
                          key={product.id}
                          href={`/product/${
                            product.id
                          }/${product.name.replaceAll(" ", "-")}`}
                        >
                          <motion.div
                            variants={{
                              open: {
                                y: 0,
                                transition: { duration: 0.2 },
                                opacity: 1,
                              },
                              close: { y: 20, opacity: 0 },
                            }}
                            className="border border-[#f3f3f3] rounded-[5px] flex flex-row items-center justify-start gap-2"
                          >
                            <Image
                              width={120}
                              height={120}
                              alt={product.imageNames[0]}
                              src={`${process.env.NEXT_PUBLIC_STATIC_FILES_ENDPOINT}/productImages/${product.imageNames[0]}`}
                            />
                            <span>
                              {product.name} { product?.ProductVariation?.length &&
                              product.ProductVariation[0]?.values[0]?.length
                                ? " - " + product.ProductVariation[0].values[0].name
                                : ""}
                            </span>
                            <span></span>
                          </motion.div>
                        </Link>
                      ))}
                    </motion.div>
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
                      className="flex flex-row gap-3 border border-[#f3f3f3] justify-between rounded-[5px] p-3 items-center"
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

        <SlideNextButton />
      </Swiper>
    </section>
  );
}
