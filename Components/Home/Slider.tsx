"use client";

import React, { useEffect, useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import Image from "next/image";
import Link from "next/link";
import { trpc } from "@/utils/trpc";

type Banner = {
  id: string;
  title: string | null;
  href: string | null;
  imageUrl: string;
};

function fadeDuration() {
  if (typeof window === "undefined") return 200;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? 0
    : 200;
}

function BannerFrame({
  banners,
  priorityFirst,
  sizes,
  sliderRef,
  opacities,
}: {
  banners: Banner[];
  priorityFirst: boolean;
  sizes: string;
  sliderRef: (node: HTMLDivElement | null) => void;
  opacities: number[];
}) {
  return (
    <div ref={sliderRef} className="fader relative h-full w-full">
      {banners.length ? (
        banners.map((banner, index) => {
          const opacity = opacities[index] ?? (index === 0 ? 1 : 0);
          const label = banner.title?.trim() || "بنر";
          const image = (
            <div className="absolute inset-0 overflow-hidden">
              <Image
                className="home-zoom object-cover transition-transform duration-200 ease-out group-hover:scale-[1.03]"
                src={banner.imageUrl}
                alt={banner.href ? "" : label}
                fill
                quality={75}
                priority={priorityFirst && index === 0}
                sizes={sizes}
              />
            </div>
          );
          const title = banner.title?.trim() ? (
            <p className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-16">
              <span className="line-clamp-1 text-h2 text-white md:text-h2-md">
                {banner.title}
              </span>
            </p>
          ) : null;
          const frameClass =
            "group home-focus relative block h-full w-full overflow-hidden rounded-card";

          return (
            <div
              key={banner.id}
              className="fader__slide absolute inset-0"
              style={{
                opacity,
                pointerEvents: opacity > 0.5 ? "auto" : "none",
              }}
            >
              {banner.href ? (
                <Link href={banner.href} aria-label={label} className={frameClass}>
                  {image}
                  {title}
                </Link>
              ) : (
                <div className={frameClass}>{image}{title}</div>
              )}
            </div>
          );
        })
      ) : (
        <div className="h-full w-full rounded-card bg-hover1" />
      )}
    </div>
  );
}

export default function Slider() {
  const { data, isLoading } = trpc.banner.listActive.useQuery();
  const hero = data?.hero || [];
  const side = data?.side || [];

  const [sliderControl, setSliderControl] = useState(0);
  const [sideControl, setSideControl] = useState(0);
  const [opacities, setOpacities] = useState<number[]>([]);
  const [sideOpacities, setSideOpacities] = useState<number[]>([]);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
    {
      slides: Math.max(hero.length, 1),
      loop: hero.length > 1,
      renderMode: "precision",
      defaultAnimation: { easing: (t: number) => t, duration: fadeDuration() },
      detailsChanged(s) {
        setOpacities(s.track.details.slides.map((slide) => slide.portion));
      },
      animationEnded(s) {
        setSliderControl(s.track.details.abs);
      },
    },
    [],
  );

  const [sideRef, sideInstance] = useKeenSlider<HTMLDivElement>(
    {
      slides: Math.max(side.length, 1),
      loop: side.length > 1,
      renderMode: "precision",
      defaultAnimation: { easing: (t: number) => t, duration: fadeDuration() },
      detailsChanged(s) {
        setSideOpacities(s.track.details.slides.map((slide) => slide.portion));
      },
      animationEnded(s) {
        setSideControl(s.track.details.abs);
      },
    },
    [],
  );

  useEffect(() => {
    if (hero.length <= 1) return;
    const timeOut = setTimeout(() => {
      instanceRef.current?.moveToIdx(
        (instanceRef.current?.track.details.abs || 0) + 1,
        true,
      );
    }, 8000);
    return () => clearTimeout(timeOut);
  }, [sliderControl, hero.length, instanceRef]);

  useEffect(() => {
    if (side.length <= 1) return;
    const timeOut = setTimeout(() => {
      sideInstance.current?.moveToIdx(
        (sideInstance.current?.track.details.abs || 0) + 1,
        true,
      );
    }, 6000);
    return () => clearTimeout(timeOut);
  }, [sideControl, side.length, sideInstance]);

  useEffect(() => {
    instanceRef.current?.update();
  }, [hero.length, instanceRef]);

  useEffect(() => {
    sideInstance.current?.update();
  }, [side.length, sideInstance]);

  const frameClass =
    "grid aspect-[4/5] w-full grid-cols-1 gap-4 md:aspect-[12/5] md:grid-cols-[2fr_1fr]";

  if (isLoading) {
    return (
      <section className={frameClass} aria-hidden>
        <div className="h-full min-h-0 animate-pulse rounded-card bg-hover1" />
        <div className="hidden h-full min-h-0 animate-pulse rounded-card bg-hover1 md:block" />
      </section>
    );
  }

  return (
    <section className={frameClass}>
      <div className="h-full min-h-0">
        <BannerFrame
          banners={hero}
          priorityFirst
          sizes="(max-width: 767px) 90vw, 66vw"
          sliderRef={sliderRef}
          opacities={opacities}
        />
      </div>
      <div className="hidden h-full min-h-0 md:block">
        <BannerFrame
          banners={side}
          priorityFirst={false}
          sizes="33vw"
          sliderRef={sideRef}
          opacities={sideOpacities}
        />
      </div>
    </section>
  );
}
