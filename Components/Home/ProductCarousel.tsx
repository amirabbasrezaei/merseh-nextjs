import React, { useEffect, useState } from "react";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import Image from "next/image";
import { Chevron_Down_sharp_light } from "../SVGS";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import splitNumber from "../utils/splitNumber";
import ProductCard from "../Product/ProductCard";
interface props {
  title: string;
  sliderStartDelay: number;
}
const animation = { duration: 1000, easing: (t: any) => t };
export default function ProductCarousel({ title, sliderStartDelay }: props) {
  const [sliderIndex, setSliderIndex] = useState(0);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [sliderRef, instanceRef] = useKeenSlider(
    {
      slideChanged() {},
      loop: true,
      slides: { spacing: 10, perView: 3 },
      renderMode: "performance",
      defaultAnimation: {},
      created(s) {
        setTimeout(() => {
          s.moveToIdx(1, true, animation);
        }, sliderStartDelay);
      },
      updated(s) {
        setTimeout(() => {
          s.moveToIdx(s.track.details.abs + 1, true, animation);
        }, sliderStartDelay);
      },
      animationEnded(s) {
        setTimeout(() => {
          s.moveToIdx(s.track.details.abs + 1, true, animation);
        }, sliderStartDelay);
      },
    },
    [
      // add plugins here
    ]
  );

  useEffect(() => {
    const sliderContainer = document.getElementById("sliderContainer");
    const sliderNodes = sliderContainer?.childNodes;

    let index = 0;
    const func = () => {
      if (sliderNodes?.length && sliderContainer) {
        if (index + 2 > sliderNodes?.length) {
          index = 0;
        }
        sliderContainer.scrollTo({
          left: -(sliderNodes[0] as HTMLElement).scrollWidth * index,
          behavior: "smooth",
        });
        ++index;
      }
      setTimeout(() => {
        func();
      }, 6000);
    };
    func();
  }, []);
  const { data: productCarouselData, isLoading } =
    trpc.product.productCarousel.useQuery();

  return (
    <section className="w-full  flex flex-col items-center gap-5 ">
      <span className="text-[25px] text-black1 font-normal">{title}</span>
      <div className="flex flex-row justify-center items-center h-full w-full">
        <div className="basis-1/12 h-full w-12 hidden sm:flex justify-center items-center ">
          <Chevron_Down_sharp_light classname="rotate-[-90deg] w-6 fill-[#CCCCCC]" />
        </div>
        <div
          id="sliderContainer"
          style={{ scrollbarWidth: "none" }}
          className="sm:basis-10/12 overflow-x-scroll  gap-4  flex flex-row w-full "
        >
          {productCarouselData?.products.length
            ? productCarouselData.products.map((product, index) => (
                <ProductCard
                  price={product.price}
                  imageNames={product.imageNames}
                  isLoading={isLoading}
                  title={product.name}
                  pathname={`/product/${product.id}`}
                />
              ))
            : null}
        </div>
        <div className="basis-1/12 h-full w-12 hidden sm:flex justify-center items-center">
          <Chevron_Down_sharp_light classname="rotate-[90deg] w-6  fill-[#CCCCCC]" />
        </div>
      </div>
    </section>
  );
}
