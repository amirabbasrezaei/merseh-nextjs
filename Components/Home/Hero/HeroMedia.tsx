"use client";

import { useEffect, useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
import { trpc } from "@/utils/trpc";

type Banner = {
  id: string;
  title: string | null;
  href: string | null;
  imageUrl: string;
};

const HERO_INTERVAL_MS = 8000;
const SIDE_INTERVAL_MS = 6500;

function fadeDuration() {
  if (typeof window === "undefined") return 900;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? 0
    : 900;
}

function wrapIndex(abs: number, count: number) {
  return count ? ((abs % count) + count) % count : 0;
}

function useBannerFader(count: number, interval: number) {
  const [abs, setAbs] = useState(0);
  const [opacities, setOpacities] = useState<number[]>([]);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
    {
      slides: Math.max(count, 1),
      loop: count > 1,
      renderMode: "precision",
      defaultAnimation: { easing: (t: number) => t, duration: fadeDuration() },
      detailsChanged(s) {
        setOpacities(s.track.details.slides.map((slide) => slide.portion));
      },
      animationEnded(s) {
        setAbs(s.track.details.abs);
      },
    },
    [],
  );

  useEffect(() => {
    if (count <= 1) return;
    const timeout = setTimeout(() => {
      const slider = instanceRef.current;
      slider?.moveToIdx((slider.track.details.abs || 0) + 1, true);
    }, interval);
    return () => clearTimeout(timeout);
  }, [abs, count, interval, instanceRef]);

  useEffect(() => {
    instanceRef.current?.update();
  }, [count, instanceRef]);

  const goTo = (index: number) => {
    const slider = instanceRef.current;
    if (!slider || !count) return;
    const current = slider.track.details.abs;
    slider.moveToIdx(current + (index - wrapIndex(current, count)), true);
  };

  return {
    sliderRef,
    opacities,
    abs,
    active: wrapIndex(abs, count),
    goTo,
  };
}

type FaderProps = {
  banners: Banner[];
  interval: number;
  sizes: string;
  className: string;
  priorityFirst?: boolean;
  showProgress?: boolean;
};

function BannerFader({
  banners,
  interval,
  sizes,
  className,
  priorityFirst = false,
  showProgress = false,
}: FaderProps) {
  const { sliderRef, opacities, abs, active, goTo } = useBannerFader(
    banners.length,
    interval,
  );

  return (
    <div
      className={classNames(
        "relative isolate overflow-hidden bg-blush-100",
        className,
      )}
    >
      <div ref={sliderRef} className="fader relative h-full w-full">
        {banners.map((banner, index) => {
          const opacity = opacities[index] ?? (index === 0 ? 1 : 0);
          const visible = opacity > 0.5;
          const label = banner.title?.trim() || "بنر";
          const content = (
            <>
              <Image
                className="home-zoom object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                src={banner.imageUrl}
                alt={banner.href ? "" : label}
                fill
                priority={priorityFirst && index === 0}
                sizes={sizes}
              />
              {banner.title?.trim() ? (
                <span className="glass pointer-events-none absolute bottom-4 end-4 z-10 max-w-[62%] rounded-full px-4 py-2">
                  <span className="line-clamp-1 text-small text-plum-900">
                    {banner.title}
                  </span>
                </span>
              ) : null}
            </>
          );

          return (
            <div
              key={banner.id}
              className="absolute inset-0"
              aria-hidden={visible ? undefined : true}
              style={{ opacity, pointerEvents: visible ? "auto" : "none" }}
            >
              {banner.href ? (
                <Link
                  href={banner.href}
                  aria-label={label}
                  tabIndex={visible ? undefined : -1}
                  className="group relative block h-full w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:[outline-offset:-6px]"
                >
                  {content}
                </Link>
              ) : (
                <div className="group relative h-full w-full">{content}</div>
              )}
            </div>
          );
        })}
      </div>

      {showProgress && banners.length > 1 ? (
        <div className="glass absolute bottom-3 start-3 z-20 flex items-center rounded-full px-1.5 sm:bottom-4 sm:start-4 sm:gap-0.5 sm:px-2.5">
          {banners.map((banner, index) => {
            const isActive = index === active;
            return (
              <button
                key={banner.id}
                type="button"
                aria-label={`اسلاید ${index + 1}`}
                aria-current={isActive || undefined}
                onClick={() => goTo(index)}
                className="home-focus group flex h-7 items-center px-1"
              >
                <span
                  className={classNames(
                    "block h-[3px] overflow-hidden rounded-full transition-[width,background-color] duration-500",
                    isActive
                      ? "w-6 bg-plum-900/20 sm:w-9"
                      : "w-2.5 bg-plum-900/25 group-hover:bg-plum-900/50 sm:w-3.5",
                  )}
                >
                  {isActive ? (
                    <span
                      key={abs}
                      className="home-dot-progress block h-full w-full bg-plum-900"
                      style={{ animationDuration: `${interval}ms` }}
                    />
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

const frameClass = "rounded-panel shadow-lift";
const heroFrameClass = `${frameClass} aspect-[2/1]`;
const sideFrameClass = `${frameClass} hidden md:block`;
const gridClass =
  "grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] lg:gap-5";
const heroSizes = "(max-width: 767px) 90vw, (max-width: 1400px) 56vw, 840px";
const sideSizes = "(max-width: 1400px) 34vw, 510px";

function HeroMediaSkeleton() {
  return (
    <div className={gridClass} aria-hidden>
      <div
        className={`${heroFrameClass} animate-pulse bg-blush-100 md:aspect-[16/9]`}
      />
      <div className={`${sideFrameClass} animate-pulse bg-blush-100`} />
    </div>
  );
}

export default function HeroMedia() {
  const { data, isLoading } = trpc.banner.listActive.useQuery();

  if (isLoading) return <HeroMediaSkeleton />;

  const hero = data?.hero ?? [];
  const side = data?.side ?? [];
  const hasSide = side.length > 0;

  return (
    <div className={gridClass}>
      <BannerFader
        banners={hero}
        interval={HERO_INTERVAL_MS}
        sizes={hasSide ? heroSizes : "(max-width: 767px) 90vw, 1360px"}
        className={classNames(
          heroFrameClass,
          hasSide ? "md:aspect-[16/9]" : "md:col-span-2 md:aspect-[3/1]",
        )}
        priorityFirst
        showProgress
      />
      {hasSide ? (
        <BannerFader
          banners={side}
          interval={SIDE_INTERVAL_MS}
          sizes={sideSizes}
          className={sideFrameClass}
          showProgress
        />
      ) : null}
    </div>
  );
}
