import React from "react";
import Image from "next/image";
import Link from "next/link";
import { trpc } from "@/utils/trpc";
import { motion } from "framer-motion";
import CategoryItem from "./CategoryItem.mainCategory";

export default function Main_Categories() {
  const { data, isLoading } = trpc.product.categories.useQuery();
  return (
    <section className="flex flex-col w-full gap-5">
      <div className="flex flex-row visible sm:hidden justify-between max-w-full">
        <span className="text-[18px]  font-[500] text-black1 ">دسته‌بندی</span>
        <Link href={"/mcategory"}>
          <span className="text-[#006645]">سایر دسته‌بندی‌ها</span>
        </Link>
      </div>

      {!isLoading && data?.length && data[0]?.subCategories?.length ? (
        <motion.div
          variants={{
            open: {
              transition: { staggerChildren: 0.2, type: "spring" },
            },
          }}
          initial={"close"}
          animate={"open"}
          className="sm:h-auto h-fit flex flex-row  items-start sm:justify-evenly gap-6 sm:gap-3 overflow-x-scroll"
          style={{ scrollbarWidth: "none" }}
        >
          {data[0].subCategories.map((category, index) => (
            <CategoryItem
              key={category.id}
              id={category.id}
              image_url={category.imageUrl}
              title={category.title}
            />
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-row justify-between gap-6 sm:gap-3">
          {Array.from(Array(7)).map((e, index) => (
            <div
              key={index}
              style={{ width: 160.28 }}
              className="h-full  flex flex-col items-center gap-3 animate-pulse"
            >
              <div className="sm:w-[160px] sm:h-[160px] h-[120px] w-[120px] rounded-[10px] sm:rounded-[50px] bg-[#f1f1f1] "></div>
              <div className="w-[70%] h-5 bg-[#f1f1f1] rounded-[7px] "></div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
