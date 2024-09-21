import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import splitNumber from "@/Components/utils/splitNumber";

interface ProductSliceItemProps {
  id: number;
  name: string;
  imageName: string;
  product_variatios: any;
  price: number;
  i: number;
  sliceLength: number;
}

function ProductSliceItem({
  id,
  imageName,
  name,
  product_variatios,
  price,
  i,
  sliceLength,
}: ProductSliceItemProps) {
  return (
    <Link
      className="relative "
      key={id}
      href={`/product/${id}/${name.replaceAll(" ", "-")}`}
    >
      <motion.div
        variants={{
          open: {
            transition: { duration: 0.3 },
            opacity: 1,
            scale: 1,
          },
          close: { opacity: 0, scale: 0.5 },
        }}
        className=" px-5 py-5 rounded-[5px] flex flex-row h-full items-center justify-between gap-2"
      >
        <div className="flex flex-row items-center  gap-4">
          <Image
            className="h-[190px] w-[100px]  md:w-[110px] lg:w-[80px] xl:h-[200px] lg:h-[200px]"
            width={200}
            height={600}
            quality={100}
            alt={imageName}
            style={{ objectFit: "cover" }}
            src={`${process.env.NEXT_PUBLIC_STATIC_FILES_ENDPOINT}/productImages/${imageName}`}
          />
          <div className="flex flex-col items-start justify-center gap-1">
            <h3 className="font-[500] basis-2/4 text-[14px] md:text-[13px] lg:text-[16px] text-nowrap xl:text-[17px]  text-gray-700 w-fit">
              {name}
            </h3>
            {product_variatios?.length ? (
              <span className="font-[400] basis-2/4 text-[12px] md:text-[11px] lg:text-[14px] text-nowrap xl:text-[12px] text-black1">
                {product_variatios[0].values[0].name}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-row items-center gap-1">
          <span className="font-normal text-nowrap text-[14px] md:text-[14px] lg:text-[15px] xl:text-[15px] basis-1/4 text-green1 w-fit">
            {splitNumber(
              product_variatios?.length
                ? product_variatios[0].values[0].price
                : price
            )}{" "}
          </span>
          <span className="lg:text-[14px] text-[10px] text-black1">تومان </span>
        </div>
      </motion.div>
      {sliceLength - 1 !== i ? (
        <hr className="border-[1x] border-[#e6e6e6] w-full absolute left-0 bottom-0" />
      ) : null}
    </Link>
  );
}

interface ProductGridItemProps {
  productSlice: any;
}

export default function ProductGridItem({
  productSlice,
}: ProductGridItemProps) {
  return (
    <motion.div
      className="flex flex-col  divide-[#f3f3f3] gap-0 h-full w-full"
      variants={{
        open: {
          transition: {
            type: "spring",
            staggerChildren: 0.4,
          },
          opacity: 1,
        },
        close: { opacity: 0 },
      }}
      initial="close"
      animate={"open"}
    >
      {productSlice.map((product: any, i: number) => (
        <ProductSliceItem
          i={i}
          sliceLength={productSlice.length}
          product_variatios={product.ProductVariation}
          key={product.id}
          imageName={product.imageNames[0]}
          id={product.id}
          name={product.name}
          price={product.price}
        />
      ))}
    </motion.div>
  );
}
