import React from "react";
import { categoryType } from "../Products/Filter";
import Link from "next/link";
import { Chevron_Down } from "../SVGS";

interface Props {
  category: categoryType;
  categoryId: number;
}

export default function MobileCategoryContext({ category, categoryId }: Props) {
  return (
    <div>
      {category.subCategories?.map((subCategory: categoryType, index) => (
        <div key={index}>
          <Link
            onClick={(e) => {
              e.stopPropagation();
            }}
            className=""
            href={`/products?catId=${subCategory.id}`}
          >

            
              <span className="text-[#4E4E4E] font-[400] text-[17px]">
                {subCategory.title}
              </span>
              

          </Link>
          <div className="mb-3 flex flex-col">
            {subCategory.subCategories?.length
              ? subCategory.subCategories.map((subCat: categoryType) => (
                  <Link
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    key={subCat.id}
                    href={`/products?catId=${subCat.id}`}
                    className="mb-1"
                  >
                    <span className="text-[#4E4E4E] font-[300] text-[15px]">
                      {subCat.title}
                    </span>
                  </Link>
                ))
              : null}
          </div>
        </div>
      ))}
    </div>
  );
}
