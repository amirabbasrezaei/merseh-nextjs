import React from "react";
import Image from "next/image";
import oil from "@/public/Images/oilCat.png";
import peanut_butter from "@/public/Images/peanut-butter.png";
import dried_parsley from "@/public/Images/dried_parsley.png";
import roseWater from "@/public/Images/roseWater.png";
import arde from "@/public/Images/arde.png";
import tea from "@/public/Images/tea.png";
import Link from "next/link";
import { trpc } from "@/utils/trpc";
export default function Main_Categories() {
  const { data, isLoading } = trpc.product.categories.useQuery();
  return (
    <section className="flex flex-col w-full gap-5">
      <div className="flex flex-row justify-between max-w-full">
        <h3 className="text-[18px] font-[500] text-black1 ">دسته‌بندی</h3>
        <Link href={"/mcategory"}>
          <span className="text-green1 block sm:hidden">سایر دسته‌بندی‌ها</span>
        </Link>
      </div>
      <div
        style={{ scrollbarWidth: "none" }}
        className="sm:h-fit h-fit flex flex-row items-center sm:justify-evenly gap-6  overflow-x-scroll "
      >
        {!isLoading && data?.length && data[0]?.subCategories?.length
          ? data[0].subCategories.map((category) => (
              <Link
                href={`/products?catId=${category.id}`}
                className="flex w-full h-full flex-col items-center  max-w-none gap-3"
              >
                <Image
                  className="sm:w-[160px] h-auto w-[120px]  max-w-none rounded-[10px] sm:rounded-[50px]"
                  src={category.imageUrl}
                  alt={category.imageUrl.split("/").at(-1) || ""}
                  quality={100}
                  width={200}
                  height={200}
                  style={{ objectFit: "contain" }}
                />
                <span className="text-[14px] sm:text-[18px] text-[#4A4A4A] font-[400]">
                  {category.title}
                </span>
              </Link>
            ))
          : Array.from(Array(6)).map(() => (
              <div className="h-full w-fit flex flex-col items-center gap-3 animate-pulse">
                <div className="sm:w-[160px] sm:h-[160px] h-[120px] w-[120px] rounded-[10px] sm:rounded-[50px] bg-[#f1f1f1] "></div>
                <div className="w-[70%] h-5 bg-[#f1f1f1] rounded-[7px] "></div>
              </div>
            ))}
      </div>
    </section>
  );
}
