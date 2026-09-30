"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { Chevron_Down_sharp_light } from "../../SVGS";
import ProductCarouselItem from "./ProductCarouselItem";
import { carouselCardWidthClass } from "./cardWidth";
import SectionHeader from "../ui/SectionHeader";
export type ProductBrandLink = {
  id: number;
  name: string;
};

export type CarouselProduct = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  imageNames?: string[];
  brand?: ProductBrandLink | null;
};

type Props = {
  title: string;
  logoUrl?: string | null;
  showMoreHref?: string | null;
  products: CarouselProduct[];
};

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
      className="home-focus home-motion hidden h-10 w-10 items-center justify-center rounded-full border border-line bg-white disabled:cursor-not-allowed disabled:opacity-40 sm:flex"
    >
      <Chevron_Down_sharp_light
        classname={`${isPrev ? "rotate-[-90deg]" : "rotate-[90deg]"} w-6 fill-lightBlack`}
      />
    </button>
  );
}

export default function ProductCarousel({
  title,
  logoUrl,
  showMoreHref,
  products,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [edges, setEdges] = useState({ isBeginning: true, isEnd: true });

  const syncEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const cards = [...el.querySelectorAll<HTMLElement>("[data-card]")];
    if (!cards.length) {
      setEdges({ isBeginning: true, isEnd: true });
      return;
    }
    if (el.scrollWidth - el.clientWidth <= 8) {
      setEdges({ isBeginning: true, isEnd: true });
      return;
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
    setEdges({
      isBeginning: startDelta <= 8,
      isEnd: lastVisible,
    });
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    syncEdges();
    const observer = new ResizeObserver(() => syncEdges());
    observer.observe(el);
    return () => observer.disconnect();
  }, [products, syncEdges]);

  const scrollByCard = (direction: "prev" | "next") => {
    const el = scrollerRef.current;
    if (!el) return;
    const cards = [...el.querySelectorAll<HTMLElement>("[data-card]")];
    if (!cards.length) return;
    const view = el.getBoundingClientRect();
    const rtl = getComputedStyle(el).direction === "rtl";
    const startEdge = rtl ? view.right : view.left;
    let current = 0;
    let best = Number.POSITIVE_INFINITY;
    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const edge = rtl ? rect.right : rect.left;
      const delta = Math.abs(edge - startEdge);
      if (delta < best) {
        best = delta;
        current = index;
      }
    });
    const target = cards[current + (direction === "next" ? 1 : -1)];
    if (!target) return;
    const targetRect = target.getBoundingClientRect();
    const edge = rtl ? targetRect.right : targetRect.left;
    const start = rtl ? view.right : view.left;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    el.scrollBy({
      left: edge - start,
      behavior: reduced ? "auto" : "smooth",
    });
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

  return (
    <div className="flex w-full flex-col gap-6">
      <SectionHeader
        id={titleId}
        title={title}
        logoUrl={logoUrl}
        href={showMoreHref}
        actions={
          <div className="hidden items-center gap-2 sm:flex">
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

      <div
        ref={scrollerRef}
        dir="rtl"
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-labelledby={titleId}
        onKeyDown={onKeyDown}
        onScroll={syncEdges}
        className="home-focus no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-0 scroll-smooth py-3 motion-reduce:scroll-auto sm:gap-4"
      >
        {products.map((product) => (
          <div key={product.id} data-card className={carouselCardWidthClass}>
            <ProductCarouselItem
              id={product.id}
              name={product.name}
              imageUrl={product.imageUrl}
              imageNames={product.imageNames}
              price={product.price}
              brand={product.brand}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
