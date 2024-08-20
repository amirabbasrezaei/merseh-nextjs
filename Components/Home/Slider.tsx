import React, { use, useEffect, useState } from "react";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import Image from "next/image";
import herbalTea from "../../public/Images/Herbal-Tea.webp";
import herbalTea2 from "../../public/Images/Herbal-Tea2.webp";
import banner2 from "../../public/Images/banner/nothing-is-like-olive-oil.webp";
import image3 from "../../public/Images/1713952254.webp";
import Link from "next/link";
import classNames from "classnames";

export default function Slider() {
  const [sliderControl, setSliderControl] = useState<number>();
  const [sliderControl1, setSliderControl1] = useState<number>();

  const [opacities, setOpacities] = useState<number[]>([]);
  const [opacities1, setOpacities1] = useState<number[]>([]);
  // const [sliderRef, instanceRef] = useKeenSlider(
  //   {
  //     slides: 2,
  //     loop: true,
  //     //   mode: "snap",
  //     renderMode: "precision",
  //     defaultAnimation: { easing: (t: any) => t, duration: 500 },

  //     created(s) {
  //       setTimeout(() => {
  //         s.moveToIdx(1, true);
  //       }, 3000);
  //     },
  //     detailsChanged(s) {
  //       const newOpacity = s.track.details.slides.map((slide) => slide.portion);
  //       setOpacities(newOpacity);
  //     },
  //     animationEnded(s) {
  //       setSliderControl(s.track.details.abs + 1);
  //     },
  //   },
  //   [
  //     // add plugins here
  //   ]
  // );

  // useEffect(() => {
  //   let timeOut = setTimeout(() => {
  //     instanceRef.current?.moveToIdx(
  //       instanceRef.current?.track.details.abs + 1,
  //       true
  //     );
  //   }, 8000);
  //   return () => {
  //     clearTimeout(timeOut);
  //   };
  // }, [sliderControl]);


  // const [sliderRef1, instanceRef1] = useKeenSlider(
  //   {
  //     slides: 2,
  //     loop: true,
  //     mode: "snap",
  //     renderMode: "precision",
  //     defaultAnimation: { easing: (t: any) => t, duration: 500 },

  //     created(s) {
  //       setTimeout(() => {
  //         s.moveToIdx(1, true);
  //       }, 6000);
  //     },
  //     detailsChanged(s) {
  //       const newOpacity = s.track.details.slides.map((slide) => slide.portion);
  //       setOpacities1(newOpacity);
  //     },
  //     animationEnded(s) {
  //       setSliderControl1(s.track.details.abs + 1);
  //     },
  //   },
  //   [
  //     // add plugins here
  //   ]
  // );

  // useEffect(() => {
  //   let timeOut = setTimeout(() => {
  //     instanceRef1.current?.moveToIdx(
  //       instanceRef1.current?.track.details.abs + 1,
  //       true
  //     );
  //   }, 6000);
  //   return () => {
  //     clearTimeout(timeOut);
  //   };
  // }, [sliderControl1]);

  return (
    <section className="flex flex-row sm:gap-4 w-full h-[350px] sm:h-[430px]   items-center justify-evenly">
      <div className="sm:basis-2/3 h-full fader  relative"
      //  ref={sliderRef}
       >
        {/* <div className={classNames("fader__slide absolute top-0  w-full h-full", instanceRef.current?.track?.details?.rel == 0 ? "z-10" : "z-0")} key={0}>
          <Link className="w-full h-full z-10" href={"https://merseh.com/"}>
            <Image
              className=" w-full h-full absolute rounded-[10px]"
              style={{ opacity: opacities[0], objectFit: "cover" }}
              src={herbalTea2}
              alt=""
              quality={100}
              priority={true}
            />
          </Link>
        </div> */}
        <div 
        className={classNames("fader__slide absolute top-0  w-full h-full",
          //  instanceRef.current?.track?.details?.rel == 1 ? "z-10" : "z-0"
          )} key={1}
           >
          <Link href={"https://merseh.com/category/4/%D8%B1%D9%88%D8%BA%D9%86-%D8%B2%DB%8C%D8%AA%D9%88%D9%86"}>
            <Image
              className=" w-full h-full top-0 rounded-[10px]"
              style={{ opacity: opacities[1], objectFit: "cover" }}
              src={banner2}
              alt=""
              quality={100}
              priority={true}
            />
          </Link>
        </div>
      </div>

      <div
        className="w-full sm:basis-1/3 h-full fader  relative"
        // ref={sliderRef1}
      >
        {/* <div
          style={{ objectFit: "cover", opacity: opacities1[0] }}
          className="fader__slide h-full w-full bg-gray-100 rounded-[10px] absolute"
        ></div> */}
        <div
          style={{ objectFit: "cover", opacity: opacities1[1] }}
          className="fader__slide h-full w-full bg-gray-200 rounded-[10px] absolute"
        >
          <Image
            className="rounded-[10px] h-full w-full"
            src={herbalTea}
            width={600}
            height={600}
            alt="herbal-tea"
            style={{ objectFit: "fill" }}
          />
        </div>
      </div>
    </section>
  );
}
