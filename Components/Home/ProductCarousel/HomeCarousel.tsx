"use client";

import React from "react";

import { trpc } from "@/utils/trpc";
import Section, { type Tone } from "../ui/Section";
import CarouselSkeleton from "./CarouselSkeleton";
import ProductCarousel from "./ProductCarousel";

type Props = {
  id: string;
  tone?: Tone;
};

export default function HomeCarousel({ id, tone = "plain" }: Props) {
  const { data, isLoading } = trpc.carousel.listActive.useQuery();
  const carousel = data?.carousels.find((item) => item.slot === id);

  if (isLoading) {
    return (
      <Section tone={tone} bleed={tone === "ivory"}>
        <CarouselSkeleton />
      </Section>
    );
  }

  if (!carousel) return null;

  return (
    <Section tone={tone} bleed={tone === "ivory"}>
      <ProductCarousel
        title={carousel.title}
        logoUrl={carousel.logoUrl}
        showMoreHref={carousel.showMoreHref}
        products={carousel.products}
        tileSurface={tone === "ivory" ? "white" : "ivory"}
      />
    </Section>
  );
}
