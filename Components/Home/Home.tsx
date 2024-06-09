"use client";
import { trpc } from "@/utils/trpc";
import React from "react";
import Header from "./Header";
import Slider from "./Slider";
import Main_Categories from "./Main_Categories";
import ProductCarousel from "./ProductCarousel";
import Footer from "../Footer";

export default function Home() {
  return (
    <div className="flex flex-col gap-10 sm:gap-16">
      <Slider />
      <Main_Categories />
      <ProductCarousel
        key={"popular_products"}
        title="محصولات جدید"
        sliderStartDelay={5000}
      />
      <div className="h-[221px] w-full rounded-[10px] px-4 bg-gray-100"></div>
      {/* <ProductCarousel
        key={"off_products"}
        title="تخفیف دار ها"
        sliderStartDelay={8000}
      /> */}
    </div>
  );
}
