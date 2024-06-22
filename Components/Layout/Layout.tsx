"use client";
import React, { Suspense, useEffect, useState } from "react";
import Header from "../Home/Header";
import { IRANYekanXFaNum } from "@/app/fonts";
import Footer from "../Footer";
import { motion } from "framer-motion";
import Navbar from "../Navbar/Navbar";
import classNames from "classnames";
import Loading from "./Loading";

interface props {
  children: React.ReactNode;
  header?: boolean;
  footer?: boolean;
  fullWidth?: boolean;
}

export default function Layout({
  children,
  header = true,
  footer = true,
  fullWidth = false,
}: props) {
  const [isAnimating, setIsAnimating] = useState(false);

  return (
    <Suspense fallback={<Loading />}>
      <motion.main
        className={`justify-center items-center  flex  bg-white w-screen overflow-x-hidden  sm:mb-0 mb-[100px]  h-screen`}
      >
        <div
          className={classNames(
            "max-w-[1400px]    gap-16 sm:w-full flex-col  items-center flex overflow-y-visible bg-white h-full ",
            fullWidth ? "w-full" : "w-[90%]"
          )}
        >
          {header ? <Header /> : null}
          <Navbar />
          <div className=" w-full grow  flex flex-col gap-16">
            <div className=" grow">{children}</div>
            {footer ? (
              <div className="h-[253px]">
                <Footer />
              </div>
            ) : null}
          </div>
        </div>
      </motion.main>
    </Suspense>
  );
}
