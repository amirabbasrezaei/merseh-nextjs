"use client";

import { useKeenSlider } from "keen-slider/react";
import React, { useEffect, useRef, useState } from "react";
import "keen-slider/keen-slider.min.css";
import Image from "next/image";
import classNames from "classnames";
import { Chevron_Down_sharp_light } from "../SVGS";

interface Props {
  imageUrls: string[];
  alt: string;
}

function ThumbnailStrip({
  imageUrls,
  current,
  onSelect,
}: {
  imageUrls: string[];
  current: number;
  onSelect: (index: number) => void;
}) {
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = stripRef.current;
    const button = container?.children[current] as HTMLElement | undefined;
    if (!container || !button) return;

    const containerRect = container.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const outside =
      buttonRect.left < containerRect.left || buttonRect.right > containerRect.right;
    if (!outside) return;

    const delta =
      buttonRect.left -
      containerRect.left -
      (containerRect.width - buttonRect.width) / 2;
    container.scrollBy({ left: delta, behavior: "smooth" });
  }, [current]);

  return (
    <div
      ref={stripRef}
      className="no-scrollbar flex gap-2 overflow-x-auto"
    >
      {imageUrls.map((imgUrl, index) => (
        <button
          key={`${imgUrl}-${index}`}
          type="button"
          aria-label={`تصویر ${index + 1}`}
          aria-current={current === index ? "true" : undefined}
          onClick={() => onSelect(index)}
          className={classNames(
            "home-focus h-16 w-16 shrink-0 overflow-hidden rounded-card bg-sand ring-inset transition-shadow sm:h-[72px] sm:w-[72px]",
            current === index ? "ring-2 ring-mauve-700" : "ring-1 ring-hairline"
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
  );
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

  const currentRef = useRef(current);
  currentRef.current = current;

  const step = (delta: number) => {
    const count = imageUrls.length;
    if (count < 2) return;
    const next = (currentRef.current + delta + count) % count;
    instanceRef.current?.moveToIdx(next);
  };

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      const count = imageUrls.length;
      if (count < 2) return;
      const delta = event.key === "ArrowLeft" ? 1 : -1;
      const next = (currentRef.current + delta + count) % count;
      instanceRef.current?.moveToIdx(next);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, imageUrls.length]);

  if (!imageUrls.length) {
    return <div className="h-56 w-full rounded-panel bg-sand sm:h-64 lg:h-80" />;
  }

  const openLightbox = () => {
    if (dragged.current) return;
    setOpen(true);
  };

  const select = (index: number) => {
    instanceRef.current?.moveToIdx(index);
  };

  const countLabel = `${(current + 1).toLocaleString("fa-IR")} / ${imageUrls.length.toLocaleString("fa-IR")}`;

  return (
    <>
      <div className="flex w-full flex-col overflow-hidden rounded-panel bg-sand">
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
          className="home-focus relative h-56 cursor-pointer sm:h-64 lg:h-80"
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
                  sizes="(min-width: 1024px) 36vw, 90vw"
                  quality={75}
                  priority={index === 0}
                  className="object-contain"
                />
              </div>
            ))}
          </div>
          {imageUrls.length > 1 ? (
            <span className="pointer-events-none absolute bottom-4 start-4 rounded-full bg-white/90 px-2.5 py-1 text-caption text-plum-900">
              {countLabel}
            </span>
          ) : null}
        </div>

        {imageUrls.length > 1 ? (
          <div className="shrink-0 border-t border-hairline px-3 py-3">
            <ThumbnailStrip
              imageUrls={imageUrls}
              current={current}
              onSelect={select}
            />
          </div>
        ) : null}
      </div>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          className="fixed inset-0 z-50 flex items-center justify-center bg-plum-900/75 p-4 sm:p-8"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            aria-label="بستن"
            onClick={() => setOpen(false)}
            className="home-focus absolute end-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[22px] leading-none text-plum-900"
          >
            ×
          </button>
          <div
            className="flex w-full max-w-4xl flex-col gap-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative h-[min(70vh,720px)] w-full">
              {imageUrls.length > 1 ? (
                <button
                  type="button"
                  aria-label="تصویر قبلی"
                  onClick={() => step(-1)}
                  className="home-focus absolute start-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-plum-900"
                >
                  <Chevron_Down_sharp_light classname="h-4 w-4 -rotate-90 fill-current" />
                </button>
              ) : null}
              <Image
                alt={imageUrls.length > 1 ? `${alt} - ${current + 1}` : alt}
                src={imageUrls[current] ?? imageUrls[0]}
                fill
                sizes="90vw"
                quality={75}
                className="object-contain"
              />
              {imageUrls.length > 1 ? (
                <button
                  type="button"
                  aria-label="تصویر بعدی"
                  onClick={() => step(1)}
                  className="home-focus absolute end-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-plum-900"
                >
                  <Chevron_Down_sharp_light classname="h-4 w-4 rotate-90 fill-current" />
                </button>
              ) : null}
            </div>
            {imageUrls.length > 1 ? (
              <ThumbnailStrip
                imageUrls={imageUrls}
                current={current}
                onSelect={select}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
