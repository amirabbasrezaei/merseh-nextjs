import React from "react";
import { motion } from "framer-motion";
export default function ProductCardSkeleton() {
  return (
    <motion.div
      transition={{ duration: 0.4 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="  border border-[#EDEDED] rounded-[12px] w-fit h-full flex justify-center "
    >
      <div className=" py-5 px-8 gap-4 flex  flex-col items-center justify-center relative  h-[280px] w-[200px] border-[#EDEDED] rounded-[12px]">
        <div className="w-full h-[160px] rounded-[5px]  bg-gray-100 animate-pulse"></div>
        <span className="font-[300] rounded-[5px] text-[16px] bg-gray-100 text-black1 animate-pulse w-full h-5"></span>
        <span className="font-normal rounded-[5px] bg-gray-100 text-[16px] text-green1 w-full h-5 animate-pulse"></span>
      </div>
    </motion.div>
  );
}
