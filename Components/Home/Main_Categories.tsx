import React from "react";
import Image from "next/image";
import oil from "@/public/Images/oilCat.png";
import peanut_butter from "@/public/Images/peanut-butter.png";
import dried_parsley from "@/public/Images/dried_parsley.png";
import roseWater from "@/public/Images/roseWater.png";
import arde from "@/public/Images/arde.png";
import tea from "@/public/Images/tea.png";
export default function Main_Categories() {
  return (
    <section className="h-[151px] flex flex-row items-center justify-evenly w-full">
      <div className="flex flex-col items-center gap-3">
        <Image
          className="w-[160px] h-[160px] rounded-[50px]"
          src={oil}
          alt="oil"
          quality={100}
          width={200}
          height={200}
        />
        <span className="text-[18px] text-[#4A4A4A] font-[400]">
          روغن گیاهی
        </span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <Image
          className="w-[160px] h-[160px] rounded-[50px]"
          src={peanut_butter}
          alt="peanut_butter"
          quality={100}
          width={200}
          height={200}
        />
        <span className="text-[18px] text-[#4A4A4A] font-[400]">کره گیاهی</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <Image
          className="w-[160px] h-[160px] rounded-[50px]"
          src={dried_parsley}
          alt="dried_parsley"
          quality={100}
          width={200}
          height={200}
        />
        <span className="text-[18px] text-[#4A4A4A] font-[400]">
          سبزی خشک شده
        </span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <Image
          className="w-[160px] h-[160px] rounded-[50px]"
          src={roseWater}
          alt="roseWater"
          quality={100}
          width={200}
          height={200}
        />
        <span className="text-[18px] text-[#4A4A4A] font-[400]">عرقیجات</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <Image
          className="w-[160px] h-[160px] rounded-[50px]"
          src={arde}
          alt="arde"
          quality={100}
          width={200}
          height={200}
        />
        <span className="text-[18px] text-[#4A4A4A] font-[400]">ارده کنجد</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <Image
          className="w-[160px] h-[160px] rounded-[50px]"
          src={tea}
          alt="tea"
          quality={100}
          width={200}
          height={200}
        />
        <span className="text-[18px] text-[#4A4A4A] font-[400]">دمنوش</span>
      </div>
    </section>
  );
}
