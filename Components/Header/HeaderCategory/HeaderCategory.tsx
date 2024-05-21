"use client";
import { trpc } from "@/utils/trpc";
import React, { useState } from "react";
import CategoryItem from "./CategoryItem";
import CategoryContext from "./CategoryContext";
import { Bars, Chevron_Down } from "@/Components/SVGS";
import { motion } from "framer-motion";
export default function HeaderCategory() {
  const { data } = trpc.product.categories.useQuery();
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number>(0);
  const [showCategories, setShowCategories] = useState<boolean>(false);

  const animation = {
    open: {
      opacity: 1,
      translateY: 0,
      zIndex: 10,
    },
    closed: {
      opacity: 0,
      translateY: "40px",
      zIndex: -10,
    },
  };
  return (
    <div
      onMouseEnter={() => {
        setShowCategories(true);
      }}
      onMouseLeave={() => {
        setShowCategories(false);
      }}
      className=" basis-3/12 flex-none relative h-full flex items-center justify-center"
    >
      <div>
        <div className="flex flex-row justify-center  items-center gap-2 cursor-pointer">
          <Bars classname="w-[14px]  fill-[#303030]" />
          <span className="font-[400] text-[#303030] text-[15px] ">
            دسته‌بندی کالاها
          </span>
        </div>
      </div>

      <motion.div
        transition={{ bounce: 1, duration: 0.3, type: "tween" }}
        animate={showCategories ? "open" : "closed"}
        variants={animation}
        className="h-fit w-[800px] top-20 right-0 flex flex-row border border-[#ededed] rounded-[8px] shadow-sm absolute z-10 bg-white"
      >
        <div className="w-fit flex flex-col h-fit justify-evenly  rounded-[8px]">
          {data?.length && data[0].subCategories?.length
            ? data[0].subCategories.map((category, catIndex) => (
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
        <div className="basis-5/6 p-6">
          {data?.length &&
          data[0].subCategories?.length &&
          data[0].subCategories[selectedCategoryIndex] ? (
            <CategoryContext
              category={data[0].subCategories[selectedCategoryIndex]}
              categoryId={data[0].subCategories[selectedCategoryIndex].id}
              setShowCategories={setShowCategories}
            />
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
