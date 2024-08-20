import { useKeenSlider } from "keen-slider/react";
import React, { Ref } from "react";
import "keen-slider/keen-slider.min.css";
import Image from "next/image";
import classNames from "classnames";

function ThumbnailPlugin(mainRef: any) {
  return (slider: any) => {
    function removeActive() {
      slider.slides.forEach((slide: any) => {
        slide.classList.remove("active");
      });
    }
    function addActive(idx: any) {
      slider.slides[idx].classList.add("active");
    }

    function addClickEvents() {
      slider.slides.forEach((slide: any, idx: any) => {
        slide.addEventListener("click", () => {
          if (mainRef.current) mainRef.current.moveToIdx(idx);
        });
      });
    }

    slider.on("created", () => {
      if (!mainRef.current) return;
      addActive(slider.track.details.rel);
      addClickEvents();
      mainRef.current.on("animationStarted", (main: any) => {
        removeActive();
        const next = main.animator.targetIdx || 0;
        addActive(main.track.absToRel(next));
        slider.moveToIdx(Math.min(slider.track.details.maxIdx, next));
      });
    });
  };
}

interface Props {
  imageUrls: string[];
}

export default function ProductImages({ imageUrls }: Props) {
  const [sliderRef, instanceRef] = useKeenSlider({
    initial: 0,
  });
  const [thumbnailRef] = useKeenSlider(
    {
      initial: 0,
      slides: {
        perView: 4,
        spacing: 10,
      },
    },
    [ThumbnailPlugin(instanceRef)]
  );

  return (
    <div className="w-full sm:w-[500px] h-fit">
      <div ref={sliderRef} className="keen-slider h-full">
        {imageUrls.map((imgUrl, i) => (
          <div
            key={i}
            className={classNames(
              "keen-slider__slide  number-slide1",
              `number-slide${i}`
            )}
          >
            <Image
              className="w-[500px] h-fit"
              alt={imgUrl.split("/").at(-1) as string}
              src={imgUrl}
              width={500}
              height={500}
              style={{ objectFit: "contain" }}
              quality={100}
            />
          </div>
        ))}
      </div>

      {imageUrls.length > 1 ? (
        <div
          ref={thumbnailRef}
          className="keen-slider thumbnail flex felx-row justify-center relative rounded-[10px]"
        >
          {imageUrls.length > 3 ? (
            <div className="absolute left-0 z-10   bg-gradient-to-r  from-white  w-[80px] h-full"></div>
          ) : null}
          {imageUrls.map((imgUrl, i) => (
            <div
              key={i}
              className={classNames(
                "keen-slider__slide w-[100px] h-[100px]   rounded-[10px] flex items-center justify-center",
                `number-slide${i}`
              )}
            >
              <Image
                className="w-[90px] h-[90px]"
                alt={imgUrl.split("/").at(-1) as string}
                src={imgUrl}
                width={90}
                height={90}
                style={{ objectFit: "contain" }}
                quality={40}
              />
            </div>
          ))}
          {imageUrls.length > 3 ? (
            <div className="absolute right-0 z-10   bg-gradient-to-l  from-white  w-[80px] h-full"></div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
