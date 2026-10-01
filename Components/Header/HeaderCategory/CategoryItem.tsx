import { Chevron_Down } from "@/Components/SVGS";
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
      href={`/category/${categoryId}/${categoryName.replaceAll(" ", "-")}`}
    >
      <div
        onMouseOver={() => setSelectedCategoryIndex(categoryIndex)}
        className={classNames(
          "flex h-12 cursor-pointer flex-row items-center justify-between gap-2 rounded-xl px-3.5 transition-colors",
          isSelected
            ? "bg-white text-mauve-700 shadow-card"
            : "bg-transparent text-black1 hover:bg-white/80 hover:text-plum-900"
        )}
      >
        <span className="text-inherit text-[15px] font-[500] text-nowrap">
          {categoryName}
        </span>
        {isSelected ? (
          <Chevron_Down classname="h-auto w-2.5 shrink-0 rotate-90 fill-mauve-700" />
        ) : null}
      </div>
    </Link>
  );
}
