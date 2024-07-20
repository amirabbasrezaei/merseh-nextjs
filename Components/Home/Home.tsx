"use client";

import React from "react";

import Slider from "./Slider";
import Main_Categories from "./Main_Categories";
import ProductCarousel from "./ProductCarousel";

import ProductsGrid from "./ProductsGrid";

export default function Home() {
  return (
    <div className="flex flex-col gap-10 sm:px-5">
      <Slider />
      <div className="w-full flex justify-center relative">
        <hr className="w-full" />
        <h1 className="absolute -top-3 bg-white px-4">فروشگاه مرسه</h1>
      </div>
      <Main_Categories />
      <ProductsGrid categoryId={2} title="روغن های گیاهی" />
      {/* <ProductsGrid categoryId={6} title="گیاهان خشک شده"/> */}
      <ProductCarousel
        key={"popular_products"}
        title="محصولات جدید"
        sliderStartDelay={5000}
      />
    </div>
  );
}
