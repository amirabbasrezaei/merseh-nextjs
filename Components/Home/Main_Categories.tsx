import React from "react";
import Image from "next/image";
import Link from "next/link";
import { trpc } from "@/utils/trpc";
export default function Main_Categories() {
  const { data, isLoading } = trpc.product.categories.useQuery();
  return (
    <section className="flex flex-col w-full gap-5">
      <div className="flex flex-row visible sm:hidden justify-between max-w-full">
        <span className="text-[18px]  font-[500] text-black1 ">
          دسته‌بندی
        </span>
        <Link href={"/mcategory"}>
          <span className="text-green1 ">سایر دسته‌بندی‌ها</span>
        </Link>
      </div>
      <div
        style={{ scrollbarWidth: "none" }}
        className="sm:h-fit h-fit flex flex-row items-center sm:justify-evenly gap-6 sm:gap-3 overflow-x-scroll "
      >
        {!isLoading && data?.length && data[0]?.subCategories?.length
          ? data[0].subCategories.map((category, index) => (
              <Link
                key={index}
                href={`/products?catId=${category.id}`}
                className="flex w-full h-full flex-col items-center  max-w-none gap-3"
              >
                <Image
                  className="lg:w-[150px] lg:h-[150px] md:w-[125px] md:h-[125px]   w-[110px]  h-[110px] max-w-none rounded-[30px] lg:rounded-[50px] md:rounded-[40px] "
                  src={category.imageUrl}
                  alt={category.imageUrl.split("/").at(-1) || ""}
                  quality={100}
                  width={200}
                  height={200}
                  style={{ objectFit: "contain" }}
                />
                <h2 className="text-[14px] sm:text-[18px] text-[#4A4A4A] font-[400] text-nowrap">
                  {category.title}
                </h2>
              </Link>
            ))
          : Array.from(Array(7)).map((e, index) => (
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
    </section>
  );
}
