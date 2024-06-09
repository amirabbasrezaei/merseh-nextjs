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
  return (
    <motion.div
      transition={{ duration: 0.3 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex justify-center w-full"
    >
      <Link className="w-full" href={{ pathname }}>
        <div className="border h-[130px] sm:h-[350px] w-full sm:w-[200px] justify-between py-1 gap-3 flex sm:flex-col flex-row items-center sm:justify-center relative   border-[#EDEDED] rounded-[12px] px-5 sm:px-0">
          <Image
            className="sm:h-[70%] h-full w-auto basis-1/4"
            style={{ objectFit: "contain" }}
            src={`${process.env.NEXT_PUBLIC_STATIC_FILES_ENDPOINT}/productImages/${imageNames[0]}`}
            alt={title}
            quality={100}
            width={150}
            height={190}
          />
          <span className="font-[400] basis-2/4 text-[14px] sm:text-[16px] text-black1 w-full sm:w-fit">
            {title}
          </span>
          <span className="font-normal text-[14px] sm:text-[16px] basis-1/4 text-green1 w-full sm:w-fit">
            {splitNumber(price)} <span className="text-[11px]">تومان</span>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
