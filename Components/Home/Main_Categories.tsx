import React from "react";
import Image from "next/image";
import oil from "@/public/Images/oilCat.png";
import peanut_butter from "@/public/Images/peanut-butter.png";
import dried_parsley from "@/public/Images/dried_parsley.png";
import roseWater from "@/public/Images/roseWater.png";
import arde from "@/public/Images/arde.png";
import tea from "@/public/Images/tea.png";
import Link from "next/link";
export default function Main_Categories() {
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
        <div className="flex flex-col items-center h-full max-w-none gap-3">
          <Image
            className="sm:w-[160px] h-auto w-[120px]  max-w-none rounded-[10px] sm:rounded-[50px]"
            src={oil}
            alt="oil"
            quality={100}
            width={200}
            height={200}
            style={{ objectFit: "contain" }}
          />
          <span className="text-[14px] sm:text-[18px] text-[#4A4A4A] font-[400]">
            روغن گیاهی
          </span>
        </div>
        <div className="flex flex-col items-center h-full gap-3">
          <Image
            className="sm:w-[160px] h-auto w-[120px] max-w-none rounded-[10px] sm:rounded-[50px]"
            src={peanut_butter}
            alt="peanut_butter"
            quality={100}
            width={200}
            height={200}
            style={{ objectFit: "contain" }}
          />
          <span className="text-[14px] sm:text-[18px] text-[#4A4A4A] font-[400]">
            کره گیاهی
          </span>
        </div>
        <div className="flex flex-col items-center h-full gap-3">
          <Image
            className="sm:w-[160px] h-auto w-[120px] max-w-none rounded-[10px] sm:rounded-[50px]"
            src={dried_parsley}
            alt="dried_parsley"
            quality={100}
            width={200}
            height={200}
            style={{ objectFit: "contain" }}
          />
          <span className="text-[14px] sm:text-[18px] text-[#4A4A4A] font-[400]">
            سبزی خشک شده
          </span>
        </div>
        <div className="flex flex-col items-center h-full gap-3">
          <Image
            className="sm:w-[160px] h-auto w-[120px] max-w-none rounded-[10px] sm:rounded-[50px]"
            src={roseWater}
            alt="roseWater"
            quality={100}
            width={200}
            height={200}
            style={{ objectFit: "contain" }}
          />
          <span className="text-[14px] sm:text-[18px] text-[#4A4A4A] font-[400]">
            عرقیجات
          </span>
        </div>
        <div className="flex flex-col items-center h-full gap-3">
          <Image
            className="sm:w-[160px] h-auto w-[120px] max-w-none rounded-[10px] sm:rounded-[50px]"
            src={arde}
            alt="arde"
            quality={100}
            width={200}
            height={200}
            style={{ objectFit: "contain" }}
          />
          <span className="text-[14px] sm:text-[18px] text-[#4A4A4A] font-[400]">
            ارده کنجد
          </span>
        </div>
        <div className="flex flex-col items-center h-full gap-3">
          <Image
            className="sm:w-[160px] h-auto w-[120px] max-w-none rounded-[10px] sm:rounded-[50px]"
            src={tea}
            alt="tea"
            quality={100}
            width={200}
            height={200}
            style={{ objectFit: "contain" }}
          />
          <span className="text-[14px] sm:text-[18px] text-[#4A4A4A] font-[400]">
            دمنوش
          </span>
        </div>
      </div>
    </section>
  );
}
