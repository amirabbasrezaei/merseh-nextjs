import Image from "next/image";
import React from "react";
import splitNumber from "../utils/splitNumber";
import Link from "next/link";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { motion } from "framer-motion";
interface ProductCardProps {
  title: string;
  imageNames: string[];
  price: number;
  pathname: string;
  isLoading: boolean;
}

export default function ProductCard({
  imageNames,
  price,
  title,
  pathname,
  isLoading,
}: ProductCardProps) {
  console.log(
    `${process.env.NEXT_PUBLIC_STATIC_FILES_ENDPOINT}/productImages/${imageNames[0]}`
  );
  return (
    <motion.div
      transition={{ duration: 0.3 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="    flex justify-center "
    >
      <Link href={{ pathname }}>
        <div className="border h-[350px] w-[200px] py-1 gap-3 flex flex-col items-center justify-center relative   border-[#EDEDED] rounded-[12px]">
          <Image
            className="h-[70%] w-auto "
            style={{ objectFit: "contain" }}
            src={`${process.env.NEXT_PUBLIC_STATIC_FILES_ENDPOINT}/productImages/${imageNames[0]}`}
            alt={title}
            quality={100}
            width={150}
            height={190}
          />
          <span className="font-[300] text-[16px] text-black1">{title}</span>
          <span className="font-normal  text-[16px] text-green1">
            {splitNumber(price)} تومان
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
