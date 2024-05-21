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
  return (
    <motion.div className="flex flex-col ">
      {/* <Link href={`/products?catId=${categoryId}`}>
        <span className="text-green2">{`همه محصولات ${category.title}`}</span>
      </Link> */}
      {category.subCategories?.map((subCategory: categoryType, index) => (
        <>
          <Link
            onClick={(e) => {
              e.stopPropagation();
              setShowCategories(false);
            }}
            className=""
            href={`/products?catId=${subCategory.id}`}
            key={index}
          >
            <div>
              <span className="text-[#4E4E4E] font-[400] text-[19px]">
                {subCategory.title}
              </span>
            </div>
          </Link>
          <div className="mb-3 flex flex-col">
            {subCategory.subCategories?.length
              ? subCategory.subCategories.map((subCat: categoryType) => (
                  <Link href={`/products?catId=${subCat.id}`} className="mb-1">
                    <span className="text-[#4E4E4E] font-[300] text-[15px]">
                      {subCat.title}
                    </span>
                  </Link>
                ))
              : null}
          </div>
        </>
      ))}
    </motion.div>
  );
}
