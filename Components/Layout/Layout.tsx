"use client";
import React, { useEffect, useState } from "react";
import Header from "../Home/Header";
import { IRANYekanXFaNum } from "@/app/fonts";
import Footer from "../Footer";
import { motion } from "framer-motion";
import Navbar from "../Navbar/Navbar";
import classNames from "classnames";
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
  // function useWindowSize() {
  //   // Initialize state with undefined width/height so server and client renders match
  //   // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  //   const [windowSize, setWindowSize] = useState({
  //     width: 0,
  //     height: 0,
  //   });

  //   useEffect(() => {
  //     // only execute all the code below in client side
  //     // Handler to call on window resize
  //     function handleResize() {
  //       // Set window width/height to state
  //       setWindowSize({
  //         width: window.innerWidth,
  //         height: window.innerHeight,
  //       });
  //     }

  //     // Add event listener
  //     window.addEventListener("resize", handleResize);

  //     // Call handler right away so state gets updated with initial window size
  //     handleResize();

  //     // Remove event listener on cleanup
  //     return () => window.removeEventListener("resize", handleResize);
  //   }, []); // Empty array ensures that effect is only run on mount
  //   return windowSize;
  // }
  return (
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
  );
}
