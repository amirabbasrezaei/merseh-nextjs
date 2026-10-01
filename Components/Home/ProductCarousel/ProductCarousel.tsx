"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { Chevron_Down_sharp_light } from "../../SVGS";
import ProductTile, {
  type ProductTileData,
  type ProductTileSurface,
} from "@/Components/Product/ProductTile";
import { carouselCardWidthClass, carouselGapClass } from "./cardWidth";
import SectionHeader from "../ui/SectionHeader";

const carouselImageSizes =
  "(max-width: 639px) 62vw, (max-width: 767px) 42vw, (max-width: 1023px) 31vw, (max-width: 1279px) 24vw, 260px";

const EDGE_FADE = "clamp(1.5rem, 5vw, 4rem)";

type Edges = { isBeginning: boolean; isEnd: boolean };

const NO_OVERFLOW: Edges = { isBeginning: true, isEnd: true };

function edgeMask({ isBeginning, isEnd }: Edges) {
  if (isBeginning && isEnd) return undefined;
  const start = isBeginning ? "#000" : "transparent";
  const end = isEnd ? "#000" : "transparent";
  return `linear-gradient(to left, ${start} 0, #000 ${EDGE_FADE}, #000 calc(100% - ${EDGE_FADE}), ${end} 100%)`;
}

type Props = {
  title: string;
  eyebrow?: string;
  logoUrl?: string | null;
  showMoreHref?: string | null;
  products: ProductTileData[];
  tileSurface?: ProductTileSurface;
};

const carouselTitleClass =
  "text-[clamp(1.375rem,2.2vw,2rem)] font-semibold leading-[1.35]";

function CarouselGlyph() {
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-blush-100 ring-1 ring-inset ring-blush-200 md:h-9 md:w-9">
      <svg viewBox="0 0 24 24" aria-hidden className="h-[18px] w-[18px]">
        <path
          className="fill-mauve-600"
          d="M12 2.25 13.65 8.35 19.75 10 13.65 11.65 12 17.75 10.35 11.65 4.25 10 10.35 8.35 12 2.25Z"
        />
        <path
          className="fill-plum-900"
          d="m18.15 14.35.62 1.95 1.95.62-1.95.63-.62 1.95-.63-1.95-1.95-.63 1.95-.62.63-1.95Z"
        />
      </svg>
    </span>
  );
}

function TwoToneTitle({ title }: { title: string }) {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length < 2) {
    return (
      <span className="bg-gradient-to-l from-mauve-700 to-plum-900 bg-clip-text text-transparent">
        {title}
      </span>
    );
  }
  const accent = words[words.length - 1];
  const lead = words.slice(0, -1).join(" ");
  return (
    <>
      <span className="text-plum-900">{lead}</span>
      <span className="text-mauve-700"> {accent}</span>
    </>
  );
}

function isRtl(el: HTMLElement) {
  return getComputedStyle(el).direction === "rtl";
}

function alignDelta(el: HTMLElement, target: HTMLElement) {
  const view = el.getBoundingClientRect();
  const rect = target.getBoundingClientRect();
  const rtl = isRtl(el);
  const edge = rtl ? rect.right : rect.left;
  const start = rtl ? view.right : view.left;
  return edge - start;
}

function nearestCard(el: HTMLElement, cards: HTMLElement[]) {
  const view = el.getBoundingClientRect();
  const rtl = isRtl(el);
  const startEdge = rtl ? view.right : view.left;
  let best: HTMLElement | null = null;
  let bestDelta = Number.POSITIVE_INFINITY;
  for (const card of cards) {
    const rect = card.getBoundingClientRect();
    const edge = rtl ? rect.right : rect.left;
    const delta = Math.abs(edge - startEdge);
    if (delta < bestDelta) {
      bestDelta = delta;
      best = card;
    }
  }
  return best;
}

function scrollCards(el: HTMLElement, direction: "prev" | "next") {
  const cards = [...el.querySelectorAll<HTMLElement>("[data-card]")];
  const current = nearestCard(el, cards);
  if (!current) return;
  const index = cards.indexOf(current);
  const target = cards[index + (direction === "next" ? 1 : -1)];
  if (!target) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollBy({
    left: alignDelta(el, target),
    behavior: reduced ? "auto" : "smooth",
  });
}

function ArrowButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const isPrev = direction === "prev";
  return (
    <button
      type="button"
      aria-label={isPrev ? "قبلی" : "بعدی"}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={onClick}
      className="home-focus home-motion hidden h-11 w-11 items-center justify-center rounded-full border border-blush-200 bg-blush-100 hover:border-mauve-400 hover:bg-blush-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-blush-200 disabled:hover:bg-blush-100 sm:flex"
    >
      <Chevron_Down_sharp_light
        classname={`${isPrev ? "rotate-[-90deg]" : "rotate-[90deg]"} h-4 w-4 fill-mauve-700`}
      />
    </button>
  );
}

export default function ProductCarousel({
  title,
  eyebrow,
  logoUrl,
  showMoreHref,
  products,
  tileSurface,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const dragMoved = useRef(false);
  const stopDrag = useRef<(() => void) | null>(null);
  const titleId = useId();
  const [edges, setEdges] = useState<Edges>(NO_OVERFLOW);
  const [dragging, setDragging] = useState(false);

  const syncEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const cards = [...el.querySelectorAll<HTMLElement>("[data-card]")];
    const overflow = el.scrollWidth - el.clientWidth;
    if (!cards.length || overflow <= 8) {
      setEdges(NO_OVERFLOW);
      return;
    }

    const thumb = thumbRef.current;
    if (thumb) {
      const size = el.clientWidth / el.scrollWidth;
      const travel = Math.min(Math.abs(el.scrollLeft) / overflow, 1);
      thumb.style.width = `${size * 100}%`;
      thumb.style.transform = `translateX(${((-travel * (1 - size)) / size) * 100}%)`;
    }

    const view = el.getBoundingClientRect();
    const first = cards[0].getBoundingClientRect();
    const last = cards[cards.length - 1].getBoundingClientRect();
    const rtl = getComputedStyle(el).direction === "rtl";
    const startDelta = Math.abs(
      rtl ? view.right - first.right : first.left - view.left
    );
    const lastVisible =
      last.left >= view.left - 4 && last.right <= view.right + 4;
    const isBeginning = startDelta <= 8;
    setEdges((prev) =>
      prev.isBeginning === isBeginning && prev.isEnd === lastVisible
        ? prev
        : { isBeginning, isEnd: lastVisible }
    );
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    syncEdges();
    const observer = new ResizeObserver(() => syncEdges());
    observer.observe(el);
    return () => {
      observer.disconnect();
      stopDrag.current?.();
    };
  }, [products, syncEdges]);

  const scrollByCard = (direction: "prev" | "next") => {
    const el = scrollerRef.current;
    if (!el) return;
    scrollCards(el, direction);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch" || event.button !== 0) return;
    const el = scrollerRef.current;
    if (!el) return;

    dragMoved.current = false;
    const startX = event.clientX;
    const startScroll = el.scrollLeft;
    let moved = false;

    const move = (pointerEvent: PointerEvent) => {
      const dx = pointerEvent.clientX - startX;
      if (!moved) {
        if (Math.abs(dx) < 6) return;
        moved = true;
        dragMoved.current = true;
        setDragging(true);
        el.style.scrollBehavior = "auto";
        el.style.scrollSnapType = "none";
      }
      el.scrollLeft = startScroll - dx;
    };

    const end = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      stopDrag.current = null;
      el.style.scrollBehavior = "";
      el.style.scrollSnapType = "";
      setDragging(false);
      if (!moved) return;
      const nearest = nearestCard(el, [
        ...el.querySelectorAll<HTMLElement>("[data-card]"),
      ]);
      if (nearest) {
        const reduced = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;
        el.scrollBy({
          left: alignDelta(el, nearest),
          behavior: reduced ? "auto" : "smooth",
        });
      }
      window.setTimeout(() => {
        dragMoved.current = false;
      }, 0);
    };

    stopDrag.current?.();
    stopDrag.current = end;
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  };

  const onClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!dragMoved.current) return;
    event.preventDefault();
    event.stopPropagation();
    dragMoved.current = false;
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.currentTarget !== event.target) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollByCard("next");
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollByCard("prev");
    }
  };

  if (!products.length) return null;

  const mask = edgeMask(edges);
  const hasOverflow = !(edges.isBeginning && edges.isEnd);

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <SectionHeader
        id={titleId}
        eyebrow={eyebrow}
        title={<TwoToneTitle title={title} />}
        titleClassName={carouselTitleClass}
        mark={<CarouselGlyph />}
        logoUrl={logoUrl}
        href={showMoreHref}
        actions={
          <div
            className={`hidden items-center gap-2 sm:flex ${showMoreHref ? "border-s border-blush-200 ps-5" : ""}`}
          >
            <ArrowButton
              direction="prev"
              disabled={edges.isBeginning}
              onClick={() => scrollByCard("prev")}
            />
            <ArrowButton
              direction="next"
              disabled={edges.isEnd}
              onClick={() => scrollByCard("next")}
            />
          </div>
        }
      />

      <div className="flex flex-col gap-6">
        <div
          ref={scrollerRef}
          dir="rtl"
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-labelledby={titleId}
          onKeyDown={onKeyDown}
          onScroll={syncEdges}
          onPointerDown={onPointerDown}
          onClickCapture={onClickCapture}
          onDragStart={(event) => event.preventDefault()}
          style={{ maskImage: mask, WebkitMaskImage: mask }}
          className={`home-focus no-scrollbar flex cursor-grab select-none overflow-x-auto scroll-px-0 scroll-smooth pb-2 motion-reduce:scroll-auto [&_a]:cursor-grab ${dragging ? "cursor-grabbing snap-none [&_*]:cursor-grabbing" : "snap-x snap-mandatory"} ${carouselGapClass}`}
        >
          {products.map((product) => (
            <div key={product.id} data-card className={carouselCardWidthClass}>
              <ProductTile
                product={product}
                sizes={carouselImageSizes}
                surface={tileSurface}
              />
            </div>
          ))}
        </div>

        <div
          aria-hidden
          className={`relative mx-auto h-[3px] w-full max-w-[220px] overflow-hidden rounded-full bg-blush-200 transition-opacity duration-300 ${hasOverflow ? "opacity-100" : "opacity-0"}`}
        >
          <span
            ref={thumbRef}
            className="absolute inset-y-0 start-0 rounded-full bg-gradient-to-l from-champagne to-mauve-700 transition-transform duration-150 ease-out motion-reduce:transition-none"
          />
        </div>
      </div>
    </div>
  );
}
