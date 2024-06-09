import { Droplet } from "@/Components/SVGS";
import classNames from "classnames";
import Link from "next/link";
import React from "react";

interface Props {
  categoryName: string;
  setSelectedCategoryIndex: React.Dispatch<React.SetStateAction<number>>;
  categoryIndex: number;
  isSelected: boolean;
  categoryId: number;
  setShowCategories: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CategoryItem({
  categoryName,
  setSelectedCategoryIndex,
  categoryIndex,
  isSelected,
  categoryId,
  setShowCategories,
}: Props) {
  return (
    <Link
      onClick={() => {
        setShowCategories(false);
      }}
      href={`/products?catId=${categoryId}`}
    >
      <div
        onMouseOver={() => setSelectedCategoryIndex(categoryIndex)}
        className={classNames(
          "cursor-pointer   gap-1   grow flex flex-row items-center justify-start px-8  rounded-[8px]  h-[55px] w-full",
          isSelected
            ? "bg-gray-50 fill-green1 text-green1"
            : "bg-transparent text-[#4E4E4E]"
        )}
      >
        <span className=" text-inherit text-[14px] text-nowrap">
          {categoryName}
        </span>
      </div>
    </Link>
  );
}
