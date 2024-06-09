import React, { useEffect, useState } from "react";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import Image from "next/image";
import { Chevron_Down_sharp_light } from "../SVGS";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import splitNumber from "../utils/splitNumber";
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
  const { data: productCarouselData } = trpc.product.productCarousel.useQuery();

  return (
    <section className="w-full  flex flex-col items-center gap-5 ">
      <span className="text-[25px] text-black1 font-normal">{title}</span>
      <div className="flex flex-row  h-[274px] w-full">
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
                <Link
                  key={index}
                  href={`/product/${product.id}`}
                  className=" w-fit overflow-visible!  h-full flex justify-center"
                >
                  <div className="border w-[180px] flex flex-col items-center justify-evenly relative   h-full border-[#EDEDED] rounded-[12px]">
                    <Image
                      className=" w-[130px] h-[170px]  "
                      style={{ objectFit: "contain" }}
                      src={`${process.env.NEXT_PUBLIC_STATIC_FILES_ENDPOINT}/productImages/${product.imageNames[0]}`}
                      alt={product.name}
                      width={130}
                      height={130}
                    />
                    <span className="font-[400]  text-[17px] text-black1">
                      {product.name}
                    </span>
                    <span className="font-normal  text-[16px] text-green1 text-center flex justify-center items-center gap-1">
                      {splitNumber(product.price)}
                      <span className="text-[13px] text-lightBlack">
                        {" "}
                        تومان
                      </span>
                    </span>
                  </div>
                </Link>
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
