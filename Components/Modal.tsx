"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { XMark_Svg } from "./SVGS";

interface Props {
  children: React.ReactNode;
  showPortal: boolean;
  setClose?: any;
}
export default function Modal({ children, showPortal, setClose }: Props) {
  return (
    <>
      {createPortal(
        <AnimatePresence mode="sync">
          {showPortal ? (
            <motion.div
              key="portal"
              initial={{ opacity: 0, backdropFilter: "blur(0px)", zIndex: 30 }}
              animate={{ opacity: 1, backdropFilter: "blur(2px)", zIndex: 30 }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              transition={{ duration: 0.3 }}
              onClick={(e) => {
                e.stopPropagation();
                setClose(false);
              }}
              style={{ zIndex: 20 }}
              className="w-full h-fit sm:h-full     flex items-center justify-center absolute sm:fixed left-0 right-0  top-0 bottom-0 "
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-[1400px]  w-full h-fit sm:h-full flex items-center justify-center p-4 "
              >
                <motion.div
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="  sm:w-fit w-full  h-fit relative sm:border border-[#dadada] rounded-[12px] p-1 flex flex-col gap-1 bg-white"
                >
                  {setClose ? (
                    <div
                      onClick={() => setClose(false)}
                      className=" top-2 cursor-pointer hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
                    >
                      <XMark_Svg classname="w-[24px] h-[24px] fill-black1" />
                    </div>
                  ) : null}
                  {children}
                </motion.div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>,
        // @ts-nocheck
        document.body
      )}
    </>
  );
}
