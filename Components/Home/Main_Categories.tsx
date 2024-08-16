import React from "react";
import Image from "next/image";
import Link from "next/link";
import { trpc } from "@/utils/trpc";
import { motion } from "framer-motion";

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
            <Link
              key={index}
              href={`/category/${category.id}/${category.title.replaceAll(
                " ",
                "-"
              )}`}
              className="w-full h-full"
            >
              <motion.div
                variants={{
                  close: {
                    scale: 0.8,
                    opacity: 0,
                  },
                  open: {
                    scale: 1,
                    opacity: 1,
                    transition: { duration: 0.2 },
                  },
                }}
                className="flex  w-full h-full flex-col items-center   gap-3"
              >

                <Image
                  className="sm:w-full sm:h-full   w-[130px]  h-[130px] max-w-none  rounded-[30px] lg:rounded-[50px] md:rounded-[40px] "
                  src={category.imageUrl}
                  alt={category.imageUrl.split("/").at(-1) || ""}
                  quality={100}
                  width={200}
                  height={200}
                  style={{ objectFit: "contain" }}
                />
                <h2 className="text-[14px] md:text-[16x] lg:text-[14px] xl:text-[18px] text-[#4A4A4A] font-[400] ">
                  {category.title}
                </h2>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-row justify-between">
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
