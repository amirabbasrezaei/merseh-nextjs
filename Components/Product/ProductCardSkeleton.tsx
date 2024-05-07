import React from "react";
import { motion } from "framer-motion";
export default function ProductCardSkeleton() {
  return (
    <motion.div
      transition={{ duration: 0.4 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="   h-full flex justify-center "
    >
      <div className=" py-5 gap-4 flex  flex-col items-center justify-center relative  h-[350px] w-[200px] border-[#EDEDED] rounded-[12px]">
        <div className="w-[70%] h-[70%] rounded-[5px]  bg-gray-200 animate-pulse"></div>
        <span className="font-[300] rounded-[5px] text-[16px] bg-gray-200 text-black1 animate-pulse w-[70%] h-6"></span>
        <span className="font-normal rounded-[5px] bg-gray-200 text-[16px] text-green1 w-[70%] h-6 animate-pulse"></span>
      </div>
    </motion.div>
  );
}
