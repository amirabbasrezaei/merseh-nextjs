"use client";

import React from "react";

import Hero from "./Hero/Hero";
import Main_Categories from "./HomeCategories/Main_Categories";
import HomeCarousel from "./ProductCarousel/HomeCarousel";
import BrandStrip from "./BrandStrip";
import MersehMag from "./Magazine/MersehMag";
import Section from "./ui/Section";

export default function Home() {
  return (
    <div className="flex w-full flex-col gap-section sm:px-6">
      <Hero />

      <Section labelledBy="home-categories">
        <Main_Categories />
      </Section>

      <HomeCarousel id="after-categories" />

      <Section tone="ivory" bleed>
        <BrandStrip />
      </Section>

      <HomeCarousel id="after-brands" tone="ivory" />

      <Section tone="ivory" bleed labelledBy="home-magazine">
        <MersehMag />
      </Section>
    </div>
  );
}
