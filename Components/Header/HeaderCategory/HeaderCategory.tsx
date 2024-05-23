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
      translateY: 0,
      zIndex: 10,
    },
    hidden: {
      translateY: 50,
      zIndex: 20,
    },
  };

  const categoryitemAnimation = {
    open: {
      translateY: 0,
      zIndex: 10,
    },
    hidden: {
      translateY: 100,
      zIndex: 20,
    },
  };
  return (
    <div className=" basis-3/12 flex-none relative h-full flex items-center justify-center">
      <div
        className="h-[50px] flex items-center justify-center"
        onMouseEnter={() => {
          setShowCategories(true);
        }}
        onMouseLeave={() => {
          setShowCategories(false);
        }}
      >
        <div className="flex flex-row justify-center  items-center gap-2 cursor-pointer">
          <Bars classname="w-[14px]  fill-[#303030]" />
          <span className="font-[400] text-[#303030] text-[15px] ">
            دسته‌بندی کالاها
          </span>
          <motion.div
            transition={{ bounce: 0.3, duration: 0.7, type: "spring" }}
            animate={showCategories ? "open" : "hidden"}
            variants={animation}
            className=" w-[800px] top-20 right-0 flex flex-row  border-[#ededed] rounded-[8px] shadow-sm absolute bg-white"
          >
            <motion.div
              variants={categoryitemAnimation}
              className="w-fit flex-none flex flex-col h-fit justify-evenly  rounded-[8px]"
            >
              {data?.length && showCategories && data[0].subCategories?.length
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
            </motion.div>
            {/* {showCategories ? (
              <div className="w-full p-6 h-fit z-10 flex flex-col">
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
            ) : null} */}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
