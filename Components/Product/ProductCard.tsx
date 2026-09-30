import Image from "next/image";
import React from "react";
import splitNumber from "../utils/splitNumber";
import Link from "next/link";
import { motion } from "framer-motion";
interface ProductCardProps {
  title: string;
  imageNames: string[];
  price: number;
  pathname: string;
  isLoading?: boolean;
  brand?: { id: number; name: string } | null;
}

function listingImageSrc(imageName: string | undefined) {
  if (!imageName) return "";
  if (
    imageName.startsWith("http://") ||
    imageName.startsWith("https://") ||
    imageName.startsWith("/")
  ) {
    return imageName;
  }
  return `${process.env.NEXT_PUBLIC_STATIC_FILES_ENDPOINT}/productImages/${imageName}`;
}

export default function ProductCard({
  imageNames,
  price,
  title,
  pathname,
}: ProductCardProps) {
  return (
    <motion.div
      layout
      transition={{ duration: 0.2 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1,  height:"fit-content" }}
      exit={{ opacity: 0 }}
      className="flex justify-center  w-full"
    >
      <Link
        href={{ pathname }}
        className="border  p-5  h-[150px] sm:h-full w-full sm:w-full justify-between  gap-3 flex sm:flex-col flex-row items-center sm:justify-center relative   border-[#EDEDED] rounded-[12px]  "
      >
        <div className="w-full h-full flex flex-row sm:flex-col items-center">
          <Image
            title={title.replaceAll(" ", "-")}
            className="sm:w-full w-auto h-full rounded-[12px] sm:h-auto basis-1/4"
            style={{ objectFit: "contain" }}
            src={listingImageSrc(imageNames[0])}
            alt={title}
            quality={50}
            width={200}
            placeholder="blur"
            height={200}
            priority
            sizes="(max-width: 640px) 130px, (max-width: 1024px) 582px, (max-width: 1440px) 280px"
            
            blurDataURL="data:image/webp;base64,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"
          />
          <h2 className="font-[400] basis-2/4 text-[14px] sm:text-[14px] text-black1 w-full sm:w-fit">
            {title}
          </h2>
        </div>
        <span className="font-normal text-nowrap text-[14px] sm:text-[16px] basis-1/4 text-[#006647] w-full sm:w-fit">
          {splitNumber(price)}{" "}
          <span className="text-[11px] text-black1">تومان</span>
        </span>
      </Link>
    </motion.div>
  );
}
