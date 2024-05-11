"use client";
import React, { useState } from "react";
import Header from "../Home/Header";
import { IRANYekanXFaNum } from "@/app/fonts";
import Footer from "../Footer";
import { motion } from "framer-motion";
interface props {
  children: React.ReactNode;
}

export default function Layout({ children }: props) {
  const [isAnimating, setIsAnimating] = useState(false);
  return (
    <motion.main
      initial={{ scale: 0.95, borderRadius: "15px" }}
      animate={{ scale: 1, borderRadius: "0px" }}
      onAnimationStart={() => setIsAnimating(true)}
      onAnimationComplete={() => setIsAnimating(false)}
      transition={{ duration: 0.3 }}
      // style={{scrollbarWidth: "none"}}
      style={{ overflow: isAnimating ? "hidden" : "auto" }}
      className={`justify-center items-center pb-10 flex  bg-white w-screen overflow-x-hidden    h-screen`}
    >
      <div className="max-w-[1400px]   gap-16 w-full flex-col  items-center flex overflow-y-visible bg-white h-full ">
        <Header />
        <div className=" w-full grow  flex flex-col gap-16">
          <div className="min-h-[1100px]">{children}</div>
          <div className="h-[253px]">
            <Footer />
          </div>
        </div>
      </div>
    </motion.main>
  );
}
