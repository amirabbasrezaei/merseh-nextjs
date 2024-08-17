"use client";
import { trpc } from "@/utils/trpc";
import React, { useState } from "react";

import { Bars } from "@/Components/SVGS";
import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";

const CategoryContext = dynamic(() => import("./CategoryContext"), {
  ssr: false,
});

const CategoryItem = dynamic(() => import("./CategoryItem"), {
  ssr: false,
});


export default function HeaderCategory() {
  const { data } = trpc.product.categories.useQuery();
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number>(0);
  const [showCategories, setShowCategories] = useState<boolean>(false);

  const animation = {
    open: {
      translateY: 0,
      zIndex: 20,
    },
    hidden: {
      translateY: 50,
      zIndex: -10,
    },
  };

  const categoryitemAnimation = {
    open: {
      translateY: 0,
    },
    hidden: {
      translateY: 20,
    },
  };

  return (
    <div className=" basis-2/12 hidden sm:flex flex-none relative h-full  items-center justify-center">
      <div
        className="h-[70px] flex items-center justify-center"
        onMouseEnter={() => {
          setShowCategories(true);
        }}
        onMouseLeave={() => {
          setShowCategories(false);
        }}
      >
        <Link
          href={`/category/1/همه-محصولات`}
          className="flex flex-row justify-center  items-center gap-2 cursor-pointer"
        >
          <Bars classname="w-[14px]  fill-[#303030]" />
          <span className="font-[400] text-[#303030] text-[15px] ">
            دسته‌بندی کالاها
          </span>
        </Link>
        <motion.div
          initial={false}
          transition={{ bounce: 0.3, duration: 0.7, type: "spring" }}
          animate={showCategories ? "open" : "hidden"}
          variants={animation}
          className=" w-[600px] p-5 top-[90px] right-0 flex flex-row border  border-[#ededed] rounded-[8px] shadow-md absolute bg-white"
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
          {showCategories ? (
            <div className="w-full px-6 py-2 h-fit z-10 flex flex-col">
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
          ) : null}
        </motion.div>
      </div>
    </div>
  );
}
