import Image from "next/image";
import React from "react";
import splitNumber from "../utils/splitNumber";
import Link from "next/link";

interface ProductCardProps {
  title: string;
  imageUrl: string;
  price: number;
  pathname: string
}

export default function ProductCard({
  imageUrl,
  price,
  title,
  pathname
}: ProductCardProps) {
  return (
    <Link href={{pathname}}>
    <div className="   h-full flex justify-center ">
      <div className="border py-5 gap-4 flex flex-col items-center justify-center relative  w-full h-full border-[#EDEDED] rounded-[12px]">
        <Image
          className="h-full w-full"
          style={{ objectFit: "cover" }}
          src={imageUrl}
          alt={title}
          quality={100}
          width={190}
          height={130}
        />
        <span className="font-[300] text-[16px] text-black1">{title}</span>
        <span className="font-normal text-[16px] text-green1">
          {splitNumber(price)} تومان
        </span>
      </div>
    </div>
    </Link>
  );
}
