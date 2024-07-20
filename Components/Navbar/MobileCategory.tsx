"use client";
import { trpc } from "@/utils/trpc";
import React, { useState } from "react";
import classNames from "classnames";
import MobileCategoryContext from "./MobileCategoryContext";
import Link from "next/link";
import { Chevron_Down } from "../SVGS";

export default function MobileCategory() {
  const { data } = trpc.product.categories.useQuery();
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number>(0);
  return (
    <div className="w-full h-full flex flex-row">
      <div className="flex flex-col gap-1 basis-[37%]">
        {data?.length && data[0].subCategories?.length
          ? data[0].subCategories.map((category, catIndex) => (
              <div
                key={category.id}
                onClick={() => setSelectedCategoryIndex(catIndex)}
                className={classNames(
                  "cursor-pointer   gap-1  px-3   flex flex-row items-center justify-center     h-[70px] w-full",
                  catIndex === selectedCategoryIndex
                    ? "bg-gray-50 fill-green1 text-green1"
                    : "bg-transparent text-[#4E4E4E]"
                )}
              >
                <span className=" text-inherit text-[14px] text-center w-fit">
                  {category.title}
                </span>
              </div>
            ))
          : null}
      </div>

      <div className="w-full px-6 py-5   flex flex-col border-r border-[rgba(227,227,227,0.47)] h-full basis-[63%]">
        {data?.length &&
        data[0].subCategories?.length &&
        data[0].subCategories[selectedCategoryIndex] ? (
          <>
            <Link
              href={`/category/${
                data[0].subCategories[selectedCategoryIndex].id
              }/${data[0].subCategories[selectedCategoryIndex].title.replaceAll(
                " ",
                "-"
              )}`}
              className="mb-5"
            >
              <div className="flex flex-row items-center">
                <span className=" font-[500] text-[14px]  text-green1  text-center w-fit">
                  همه محصولات{" "}
                  {data[0].subCategories[selectedCategoryIndex].title}
                </span>
                <Chevron_Down classname="fill-green1 w-3 rotate-[90deg]" />
              </div>
            </Link>
            <MobileCategoryContext
              category={data[0].subCategories[selectedCategoryIndex]}
              categoryId={data[0].subCategories[selectedCategoryIndex].id}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
