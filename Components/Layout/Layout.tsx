"use client";
import React, { Suspense } from "react";
import { motion } from "framer-motion";
import classNames from "classnames";
import Loading from "./Loading";
import dynamic from "next/dynamic";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

interface props {
  children: React.ReactNode;
  header?: boolean;
  footer?: boolean;
  fullWidth?: boolean;
}

const Header = dynamic(() => import("../Home/Header"), { ssr: true });
const Footer = dynamic(() => import("../Footer"), { ssr: true });
const Navbar = dynamic(() => import("../Navbar/Navbar"), { ssr: true });

export default function Layout({
  children,
  header = true,
  footer = true,
  fullWidth = false,
}: props) {
  return (
    <>
      <Suspense fallback={<Loading />}>
        <motion.main
          style={{ direction: "ltr" }}
          className={`justify-center items-center   flex  bg-white w-screen overflow-x-hidden  sm:mb-0 mb-[100px]  h-screen`}
        >
          <div
            style={{ direction: "rtl" }}
            className={classNames(
              "max-w-[1400px]    gap-16 sm:w-full flex-col  items-center flex overflow-y-visible bg-white h-full ",
              fullWidth ? "w-full" : "w-[90%]"
            )}
          >
            {header ? <Header /> : null}
            <Navbar />

            <div className=" w-full grow  flex flex-col gap-16">
              <div className=" grow">{children}</div>
              {footer ? <Footer /> : null}
            </div>
          </div>
        </motion.main>
      </Suspense>
      <ProgressBar
        shallowRouting
        options={{ showSpinner: false }}
        height="4px"
        color="#00A573"
      />
    </>
  );
}
