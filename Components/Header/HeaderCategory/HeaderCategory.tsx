"use client";
import { trpc } from "@/utils/trpc";
import React, { useEffect, useRef, useState } from "react";

import { Bars, Chevron_Down } from "@/Components/SVGS";
import classNames from "classnames";
import { motion } from "framer-motion";
import Link from "next/link";
import { toPathSlug } from "@/utils/slug";
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
    if (!categories?.length) return;
    if (categories[selectedCategoryIndex]?.subCategories?.length) return;
    const withChildren = categories.findIndex(
      (category) => category.subCategories?.length
    );
    if (withChildren >= 0) setSelectedCategoryIndex(withChildren);
  }, [categories, selectedCategoryIndex]);

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

  const root = data?.[0];
  const rootHref = root
    ? `/category/${root.id}/${toPathSlug(root.title)}`
    : "/category/1";

  return (
    <div
      className={classNames(
        "relative flex h-full flex-none items-center",
        showCategories ? "z-30" : "z-0",
      )}
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <Link
        href={rootHref}
        aria-expanded={showCategories}
        className={classNames(
          "home-focus relative z-40 flex h-8 items-center gap-2 rounded-full px-3.5 text-small font-medium transition-colors",
          showCategories
            ? "bg-blush-200 text-mauve-700"
            : "bg-sand text-plum-900 hover:bg-blush-100",
        )}
      >
        <Bars classname="w-3 fill-current" />
        <span>دسته‌بندی کالاها</span>
        <Chevron_Down
          classname={classNames(
            "w-2.5 fill-current opacity-70 transition-transform duration-300",
            showCategories && "rotate-180 opacity-100",
          )}
        />
      </Link>
      <motion.div
        initial={false}
        transition={{ duration: 0.2, ease: "easeOut" }}
        animate={showCategories ? "open" : "hidden"}
        variants={panelAnimation}
        inert={!showCategories}
        onMouseEnter={openMenu}
        className={classNames(
          "absolute start-0 top-full flex w-[min(980px,calc(100vw-4rem))] pt-2",
          showCategories ? "pointer-events-auto z-30" : "pointer-events-none z-0",
        )}
      >
        <div className="absolute inset-x-0 bottom-full h-6" />
        <div className="glass-strong flex max-h-[min(72vh,640px)] w-full overflow-hidden rounded-[22px]">
          <div className="flex w-[248px] flex-none flex-col overflow-y-auto border-e border-white/60 bg-white/40 p-2.5">
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
