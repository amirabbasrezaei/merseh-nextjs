"use client";
import React, { Suspense, useState } from "react";
import Footer from "../Footer";
import { motion } from "framer-motion";
import Navbar from "../Navbar/Navbar";
import classNames from "classnames";
import Loading from "./Loading";
import Header from "../Mag/Header/Header.mag";

interface props {
  children: React.ReactNode;
  header?: boolean;
  footer?: boolean;
  fullWidth?: boolean;
}

export default function MagLayout({
  children,
  header = true,
  footer = true,
  fullWidth = false,
}: props) {
  return (
    <Suspense fallback={<Loading />}>
      <motion.main
        style={{ direction: "ltr" }}
        className={`justify-center items-center   flex  bg-white w-screen overflow-x-hidden  md:mb-0 mb-[100px]  h-screen`}
      >
        <div
          style={{ direction: "rtl" }}
          className={classNames(
            "max-w-[1600px]    gap-16 md:w-full flex-col  items-center flex overflow-y-visible bg-white h-full ",
            fullWidth ? "w-full" : "w-[90%]"
          )}
        >
          {header ? <Header /> : null}
          <Navbar />

          <div className=" w-full grow  flex flex-col gap-16">
            <div className="grow">{children}</div>
            {footer ? <Footer /> : null}
          </div>
        </div>
      </motion.main>
    </Suspense>
  );
}
