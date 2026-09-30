"use client";

import { useKeenSlider } from "keen-slider/react";
import React, { useEffect, useRef, useState } from "react";
import "keen-slider/keen-slider.min.css";
import Image from "next/image";
import classNames from "classnames";

interface Props {
  imageUrls: string[];
  alt: string;
}

export default function ProductImages({ imageUrls, alt }: Props) {
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState(false);
  const dragged = useRef(false);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    slideChanged(slider) {
      setCurrent(slider.track.details.rel);
    },
    dragStarted() {
      dragged.current = false;
    },
    dragged() {
      dragged.current = true;
    },
    dragEnded() {
      window.setTimeout(() => {
        dragged.current = false;
      }, 0);
    },
  });

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!imageUrls.length) {
    return <div className="aspect-square w-full rounded-2xl bg-[#f7f7f7]" />;
  }

  const openLightbox = () => {
    if (dragged.current) return;
    setOpen(true);
  };

  return (
    <>
      <div
        className={classNames(
          "grid w-full grid-cols-1 gap-3",
          imageUrls.length > 1 &&
            "lg:grid-cols-[76px_minmax(0,1fr)] lg:items-stretch"
        )}
      >
        {imageUrls.length > 1 ? (
          <div className="order-2 flex gap-2 overflow-x-auto lg:order-1 lg:flex-col lg:overflow-y-auto">
            {imageUrls.map((imgUrl, index) => (
              <button
                key={`${imgUrl}-${index}`}
                type="button"
                aria-label={`تصویر ${index + 1}`}
                aria-current={current === index}
                onClick={() => instanceRef.current?.moveToIdx(index)}
                className={classNames(
                  "h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#f7f7f7] ring-1 ring-inset lg:h-[72px] lg:w-[72px]",
                  current === index ? "ring-[#00A573]" : "ring-transparent"
                )}
              >
                <Image
                  alt=""
                  src={imgUrl}
                  width={72}
                  height={72}
                  quality={70}
                  className="h-full w-full object-contain"
                />
              </button>
            ))}
          </div>
        ) : null}

        <div
          role="button"
          tabIndex={0}
          aria-label="بزرگ‌نمایی تصویر"
          onClick={openLightbox}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setOpen(true);
            }
          }}
          className="relative order-1 aspect-square cursor-pointer overflow-hidden rounded-2xl bg-[#f7f7f7] lg:order-2"
        >
          <div ref={sliderRef} className="keen-slider absolute inset-0 h-full">
            {imageUrls.map((imgUrl, index) => (
              <div
                key={`${imgUrl}-${index}`}
                className="keen-slider__slide relative h-full"
              >
                <Image
                  alt={imageUrls.length > 1 ? `${alt} - ${index + 1}` : alt}
                  src={imgUrl}
                  fill
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  quality={75}
                  priority={index === 0}
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            aria-label="بستن"
            onClick={() => setOpen(false)}
            className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[22px] leading-none text-black1"
          >
            ×
          </button>
          <div
            className="relative h-[min(80vh,720px)] w-full max-w-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              alt={alt}
              src={imageUrls[current] ?? imageUrls[0]}
              fill
              sizes="90vw"
              quality={75}
              className="object-contain"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
