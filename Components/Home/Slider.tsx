import React, { useEffect, useState } from "react";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import Image from "next/image";
import image1 from "../../public/Images/1713267092.webp";
import image2 from "../../public/Images/1713706832.webp";
import image3 from "../../public/Images/1713952254.webp";

export default function Slider() {
  const [sliderControl, setSliderControl] = useState<number>();
  const [sliderControl1, setSliderControl1] = useState<number>();

  const [opacities, setOpacities] = useState<number[]>([]);
  const [opacities1, setOpacities1] = useState<number[]>([]);
  const [sliderRef, instanceRef] = useKeenSlider(
    {
      slides: 2,
      loop: true,
      //   mode: "snap",
      renderMode: "precision",
      defaultAnimation: { easing: (t: any) => t, duration: 500 },

      created(s) {
        setTimeout(() => {
          s.moveToIdx(1, true);
        }, 2000);
      },
      detailsChanged(s) {
        const newOpacity = s.track.details.slides.map((slide) => slide.portion);
        setOpacities(newOpacity);
      },
      animationEnded(s) {
        setSliderControl(s.track.details.abs + 1);
      },
    },
    [
      // add plugins here
    ]
  );

  useEffect(() => {
    let timeOut = setTimeout(() => {
      instanceRef.current?.moveToIdx(
        instanceRef.current?.track.details.abs + 1,
        true
      );
    }, 6000);
    return () => {
      clearTimeout(timeOut);
    };
  }, [sliderControl]);

  const [sliderRef1, instanceRef1] = useKeenSlider(
    {
      slides: 2,
      loop: true,
      mode: "snap",
      renderMode: "precision",
      defaultAnimation: { easing: (t: any) => t, duration: 500 },

      created(s) {
        setTimeout(() => {
          s.moveToIdx(1, true);
        }, 6000);
      },
      detailsChanged(s) {
        const newOpacity = s.track.details.slides.map((slide) => slide.portion);
        setOpacities1(newOpacity);
      },
      animationEnded(s) {
        setSliderControl1(s.track.details.abs + 1);
      },
    },
    [
      // add plugins here
    ]
  );

  useEffect(() => {
    let timeOut = setTimeout(() => {
      instanceRef1.current?.moveToIdx(
        instanceRef1.current?.track.details.abs + 1,
        true
      );
    }, 6000);
    return () => {
      clearTimeout(timeOut);
    };
  }, [sliderControl1]);
  return (
    <section className="flex flex-row sm:gap-4 w-full h-[350px] sm:h-[430px] sm:p-6  items-center justify-evenly">
      <div className="sm:basis-2/3 h-full fader  relative" ref={sliderRef}>
        <div className="fader__slide w-full h-full bg-transparent absolute">
          <Image
            className="bg-transparent w-full h-full absolute rounded-[10px]"
            style={{ opacity: opacities[0], objectFit: "cover" }}
            src={image2}
            alt=""
          />
        </div>
        <div className="fader__slide w-full h-full bg-transparent absolute">
          <Image
            className="bg-transparent w-full h-full absolute rounded-[10px]"
            style={{ opacity: opacities[1], objectFit: "cover" }}
            src={image3}
            alt=""
          />
        </div>
      </div>

      <div
        className="w-full sm:basis-1/3 h-full fader  relative"
        ref={sliderRef1}
      >
        <div
          style={{ objectFit: "cover", opacity: opacities1[0] }}
          className="fader__slide h-full w-full bg-gray-100 rounded-[10px] absolute"
        >
          
        </div>
        <div
          style={{ objectFit: "cover", opacity: opacities1[1] }}
          className="fader__slide h-full w-full bg-gray-200 rounded-[10px] absolute"
        >
          
        </div>
      </div>
    </section>
  );
}
