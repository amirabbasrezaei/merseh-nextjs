import Image from "next/image";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
interface Props {
  id: number;
  title: string;
  image_url: string;
}
export default function CategoryItem({ id, image_url, title }: Props) {
  return (
    <Link
      href={`/category/${id}/${title.replaceAll(" ", "-")}`}
      className="w-full h-full"
    >
      <motion.div
        variants={{
          close: {
            scale: 0.8,
            opacity: 0,
          },
          open: {
            scale: 1,
            opacity: 1,
            transition: { duration: 0.2 },
          },
        }}
        className="flex  w-full h-full flex-col items-center   gap-3 relative"
      >
        <Image
          className="sm:w-full sm:h-full  bg-black  w-[130px]  h-[130px] max-w-none  rounded-[30px] lg:rounded-[50px] md:rounded-[40px] "
          src={image_url}
          alt={image_url.split("/").at(-1) || ""}
          quality={100}
          width={250}
          height={250}
          style={{ objectFit: "contain" }}
        />
        <div className="absolute top-0 right-0 left-0 flex bg-black items-center justify-center h-full w-full bg-opacity-50 z-10 rounded-[30px] lg:rounded-[50px] md:rounded-[40px]">
          <h2 className="text-[14px] md:text-[16x] lg:text-[18px] xl:text-[20px] text-white font-[500] ">
            {title}
          </h2>
        </div>
      </motion.div>
    </Link>
  );
}
