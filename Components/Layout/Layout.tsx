"use client";
import React, { useEffect, useState } from "react";
import Header from "../Home/Header";
import { IRANYekanXFaNum } from "@/app/fonts";
import Footer from "../Footer";
import { motion } from "framer-motion";
interface props {
  children: React.ReactNode;
}

export default function Layout({ children }: props) {
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
          <div 

          className=" grow">{children}</div>
          <div className="h-[253px]">
            <Footer />
          </div>
        </div>
      </div>
    </motion.main>
  );
}
