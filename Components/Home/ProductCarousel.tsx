import React from "react";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import Image from "next/image";
import image1 from "../../public/Images/small_bottle_oil.png";
import image2 from "../../public/Images/sunflower_oil.png";
import image3 from "../../public/Images/olive_oil.png";
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
  const { data: productCarouselData } = trpc.product.productCarousel.useQuery();
  const [sliderRef, instanceRef] = useKeenSlider(
    {
      slideChanged() {},
      loop: true,
      slides: { perView: 5, spacing: 10 },
      renderMode: "precision",
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

  return (
    <section className="w-full  flex flex-col items-center gap-5 ">
      <span className="text-[25px] text-black1 font-normal">{title}</span>
      <div className="flex flex-row  h-[274px] w-full">
        <div className="basis-1/12 h-full w-12 flex justify-center items-center ">
          <Chevron_Down_sharp_light classname="rotate-[-90deg] w-6 fill-[#CCCCCC]" />
        </div>
        <div
          className="basis-10/12  keen-slider flex flex-row w-full "
          ref={sliderRef}
        >
          {productCarouselData?.products.length
            ? productCarouselData.products.map((product) => (
                <Link
                  href={`/product/${product.id}`}
                  className="keen-slider__slide   h-full flex justify-center"
                >
                  <div className="border  flex flex-col items-center justify-evenly relative  w-[190px] h-full border-[#EDEDED] rounded-[12px]">
                    <Image
                      className=" w-[130px] h-auto"
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
        <div className="basis-1/12 h-full w-12 flex justify-center items-center">
          <Chevron_Down_sharp_light classname="rotate-[90deg] w-6  fill-[#CCCCCC]" />
        </div>
      </div>
    </section>
  );
}
