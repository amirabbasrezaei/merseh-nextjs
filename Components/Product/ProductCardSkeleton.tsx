import React from "react";

import { motion } from "framer-motion";
export default function ProductCardSkeleton() {
  return (
    <motion.div
      layout
      transition={{ duration: 0.1 }}
      initial={false}
      animate={{ opacity: 1, height:"fit-content" }}
      exit={{ opacity: 0 }}
      className="w-full border h-fit sm:p-5 flex border-[#EDEDED] rounded-[12px]"
    >
      <div className="w-full h-full flex flex-row sm:flex-col items-center gap-3">
        <div className="sm:w-full w-auto h-[160px] rounded-[12px] sm:h-[160px]  bg-gray-100 animate-pulse"></div>
        <span className="font-[300] rounded-[5px] text-[16px] bg-gray-100 text-black1 animate-pulse w-[85%] h-4 sm:h-5"></span>
        <span className="font-normal rounded-[5px] bg-gray-100 text-[16px] text-green1 w-[70%] h-4 sm:h-5 animate-pulse"></span>
      </div>
    </motion.div>
  );
}
