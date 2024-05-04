"use client"
import Image from 'next/image'
import React, { useState } from 'react'

import image from "@/public/Images/small_bottle_oil.png";

export default function Product() {
    type BuyOptions = {
        
    }
    const [buyOptions, setBuyOptions] = useState()
  return (
    <div className="h-[400px] w-full flex flex-row mt-[85px]">
    <div className="h-full w-full basis-4/12">
      <Image
        className="h-full w-full"
        style={{ objectFit: "contain" }}
        src={image}
        alt="small_bottle"
      />
    </div>
    <div className="h-full  w-full basis-5/12 p-4 flex flex-col gap-5">
      <h3 className="text-[24px]">روغن ارگان</h3>
      <div className="flex flex-row items-center gap-2">
        <span className="ml-4 text-[18px] text-[#252525]">نوع</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              className="appearance-none border border-[#DFDFDF] w-[20px] h-[20px] rounded-full"
              type="radio"
            />
            <span className="text-[14px] text-[#535353]">بی بو</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              className="appearance-none checked:bg-black border p-2 border-[#DFDFDF] w-[20px] h-[20px] rounded-full"
              type="radio"
            />
            <span className="text-[14px] text-[#535353]">با بو</span>
          </div>
        </div>
      </div>
    </div>
    <div className="h-full bg-red-200 w-full basis-3/12 "></div>
  </div>
  )
}
