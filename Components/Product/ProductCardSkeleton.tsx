import React from "react";
import { motion } from "framer-motion";
export default function ProductCardSkeleton() {
  return (
    <motion.div
      transition={{ duration: 0.4 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="  border border-[#EDEDED] rounded-[12px] w-full sm:w-fit h-full flex justify-center "
    >
      <div className=" sm:py-5 px-4 py-4 sm:px-8 gap-4 flex flex-row  sm:flex-col items-center justify-center relative  h-[120px] sm:h-[280px] sm:w-[200px] w-full border-[#EDEDED] rounded-[12px]">
        <div className="w-full h-full sm:h-[160px] rounded-[5px]  bg-gray-100 animate-pulse"></div>
        <span className="font-[300] rounded-[5px] text-[16px] bg-gray-100 text-black1 animate-pulse w-full h-4 sm:h-5"></span>
        <span className="font-normal rounded-[5px] bg-gray-100 text-[16px] text-green1 w-full h-4 sm:h-5 animate-pulse"></span>
      </div>
    </motion.div>
  );
}
