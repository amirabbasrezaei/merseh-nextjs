import { categoryType } from "@/Components/Products/Filter";
import Link from "next/link";
import React from "react";

interface Props {
  category: categoryType;
  categoryId: number;
  setShowCategories: React.Dispatch<React.SetStateAction<boolean>>;
}

function categoryHref(id: number, title: string) {
  return `/category/${id}/${title.replaceAll(" ", "-")}`;
}

export default function CategoryContext({
  category,
  categoryId,
  setShowCategories,
}: Props) {
  const closeMenu = () => setShowCategories(false);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4 border-b border-[#F0F0F0] pb-4">
        <h2 className="text-[18px] font-[600] text-black1">{category.title}</h2>
        <Link
          onClick={closeMenu}
          href={categoryHref(categoryId, category.title)}
          className="shrink-0 rounded-full bg-green1/10 px-3.5 py-1.5 text-[13px] font-[500] text-green2 transition-colors hover:bg-green1/20"
        >
          مشاهده همه
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 min-[900px]:grid-cols-2">
        {category.subCategories?.map((subCategory: categoryType) => (
          <div
            key={subCategory.id}
            className="flex flex-col gap-2 rounded-xl bg-[#F7F8F7] px-4 py-3.5"
          >
            <Link
              onClick={(e) => {
                e.stopPropagation();
                closeMenu();
              }}
              href={categoryHref(subCategory.id, subCategory.title)}
              className="w-fit"
            >
              <span className="text-[15px] font-[600] text-black1 hover:text-green2">
                {subCategory.title}
              </span>
            </Link>
            {subCategory.subCategories?.length ? (
              <div className="flex flex-col gap-1">
                {subCategory.subCategories.map((subCat: categoryType) => (
                  <Link
                    onClick={(e) => {
                      e.stopPropagation();
                      closeMenu();
                    }}
                    key={subCat.id}
                    href={categoryHref(subCat.id, subCat.title)}
                    className="w-fit rounded-md py-0.5"
                  >
                    <span className="text-[13px] font-[400] leading-6 text-[#5C5C5C] hover:text-green2">
                      {subCat.title}
                    </span>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
