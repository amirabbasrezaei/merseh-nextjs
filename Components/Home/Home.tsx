"use client";

import React from "react";

import Slider from "./Slider";
import Main_Categories from "./HomeCategories/Main_Categories";
import ProductCarousel from "./ProductCarousel/ProductCarousel";
import CarouselSkeleton from "./ProductCarousel/CarouselSkeleton";
import MersehMag from "./MersehMag";
import ValueProps from "./ValueProps";
import SectionBand from "./ui/SectionBand";
import { trpc } from "@/utils/trpc";

export default function Home() {
  const { data, isLoading } = trpc.carousel.listActive.useQuery();
  const carousels = data?.carousels ?? [];
  const magazineTone = carousels.length % 2 === 0 ? "tint" : "white";

  return (
    <div className="flex w-full flex-col">
      <Slider />
      <h1 className="py-10 text-center text-display text-black1 md:py-14 md:text-display-md">
        مرسه
      </h1>
      <SectionBand tone="tint" labelledBy="home-categories">
        <Main_Categories />
      </SectionBand>
      <SectionBand>
        <ValueProps />
      </SectionBand>
      {isLoading ? (
        <SectionBand tone="tint">
          <CarouselSkeleton />
        </SectionBand>
      ) : (
        carousels.map((carousel, index) => (
          <SectionBand
            key={carousel.id}
            tone={index % 2 === 0 ? "tint" : "white"}
          >
            <ProductCarousel
              title={carousel.title}
              logoUrl={carousel.logoUrl}
              showMoreHref={carousel.showMoreHref}
              products={carousel.products}
            />
          </SectionBand>
        ))
      )}
      <SectionBand
        tone={isLoading ? "white" : magazineTone}
        labelledBy="home-magazine"
      >
        <MersehMag />
      </SectionBand>
    </div>
  );
}
