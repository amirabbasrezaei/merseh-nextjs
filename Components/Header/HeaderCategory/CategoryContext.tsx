import { categoryType } from "@/Components/Products/Filter";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
interface Props {
  category: categoryType;
  categoryId: number;
  setShowCategories: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CategoryContext({
  category,
  categoryId,
  setShowCategories,
}: Props) {
  console.log(category);

  return (
    <motion.div className="flex flex-col ">
      {category.subCategories?.map((subCategory: categoryType, index) => (
        <div key={index}>
          <Link
            onClick={(e) => {
              e.stopPropagation();
              setShowCategories(false);
            }}
            className=""
            href={`/category/${subCategory.id}/${subCategory.title.replaceAll(
              " ",
              "-"
            )}`}
          >
            <div>
              <span className="text-[#4E4E4E] font-[400] text-[15px]">
                {subCategory.title}
              </span>
            </div>
          </Link>
          <div className="mb-3 flex flex-col">
            {subCategory.subCategories?.length
              ? subCategory.subCategories.map((subCat: categoryType) => (
                  <Link
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCategories(false);
                    }}
                    key={subCat.id}
                    href={`/products?catId=${subCat.id}`}
                    className="mb-1"
                  >
                    <span className="text-[#4E4E4E] font-[300] text-[13px]">
                      {subCat.title}
                    </span>
                  </Link>
                ))
              : null}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
