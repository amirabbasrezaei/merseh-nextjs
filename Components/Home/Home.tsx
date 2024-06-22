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
    <div className="flex flex-col gap-10 ">
      <Slider />
      <Main_Categories />
      <ProductCarousel
        key={"popular_products"}
        title="محصولات جدید"
        sliderStartDelay={5000}
      />

    </div>
  );
}
