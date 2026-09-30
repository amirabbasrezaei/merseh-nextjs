"use client";
import { trpc } from "@/utils/trpc";
import React, { useEffect, useRef, useState } from "react";

import { Bars } from "@/Components/SVGS";
import { motion } from "framer-motion";
import Link from "next/link";
import CategoryItem from "./CategoryItem";
import CategoryContext from "./CategoryContext";

const panelAnimation = {
  open: {
    opacity: 1,
    y: 0,
  },
  hidden: {
    opacity: 0,
    y: 8,
  },
};

export default function HeaderCategory() {
  const { data } = trpc.product.categories.useQuery();
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number>(0);
  const [showCategories, setShowCategories] = useState<boolean>(false);

  const categories = data?.[0]?.subCategories;
  const selectedCategory = categories?.[selectedCategoryIndex];
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setShowCategories(true);
  };

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setShowCategories(false), 120);
  };

  return (
    <div
      className={`basis-2/12 hidden sm:flex flex-none relative h-full items-center justify-center ${
        showCategories ? "z-30" : "z-0"
      }`}
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <Link
        href={`/category/1/همه-محصولات`}
        className="relative z-40 flex flex-row justify-center items-center gap-2 cursor-pointer hover:bg-hover1 px-4 py-2 rounded-[10px]"
      >
        <Bars classname="w-[14px] fill-[#303030]" />
        <span className="text-[16px] text-black1 font-[500]">
          دسته‌بندی کالاها
        </span>
      </Link>
      <motion.div
        initial={false}
        transition={{ duration: 0.2, ease: "easeOut" }}
        animate={showCategories ? "open" : "hidden"}
        variants={panelAnimation}
        onMouseEnter={openMenu}
        className={`top-full right-0 flex absolute w-[min(980px,calc(100vw-4rem))] ${
          showCategories ? "z-30 pointer-events-auto" : "z-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-x-0 bottom-full h-20" />
        <div className="flex w-full max-h-[min(78vh,680px)] overflow-hidden rounded-2xl border border-[#E8E8E8] border-t-[3px] border-t-green2 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.1)]">
          <div className="flex w-[248px] flex-none flex-col overflow-y-auto bg-[#F6F7F6] p-2.5">
            {categories?.length
              ? categories.map((category, catIndex) => (
                  <CategoryItem
                    setSelectedCategoryIndex={setSelectedCategoryIndex}
                    categoryName={category.title}
                    categoryIndex={catIndex}
                    key={category.id}
                    isSelected={catIndex === selectedCategoryIndex}
                    categoryId={category.id}
                    setShowCategories={setShowCategories}
                  />
                ))
              : null}
          </div>
          <div className="min-w-0 flex-1 overflow-y-auto px-6 py-5">
            {selectedCategory ? (
              <CategoryContext
                category={selectedCategory}
                categoryId={selectedCategory.id}
                setShowCategories={setShowCategories}
              />
            ) : null}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
