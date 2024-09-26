import React, { Component, ReactNode } from "react";
import {
  motion,
  AnimationProps,
  AnimationControls,
  MotionValue,
} from "framer-motion";
import { createPortal } from "react-dom";
import { XMark_Svg } from "./SVGS";
import { useRecoilState } from "recoil";
import { themeRecoilStateAtom } from "./ThemeController";

interface Props {
  children: ReactNode ;
  onClose: (e?: any) => void;
}

export default function PopUp({ children, onClose }: Props) {
  return (
    <>
      {process?.browser
        ? createPortal(
            <motion.div
              onClick={() => onClose()}
              animate={{
                opacity: 1,
                backdropFilter: "blur(2px) brightness(90%)",
              }}
              exit={{
                opacity: 0,
                backdropFilter: "blur(0px) brightness(100%)",
              }}
              initial={false}
              transition={{ duration: 0.3 }}
              className="fixed w-full h-screen left-0 top-0 right-0 bottom-0 z-40 flex items-center justify-center"
            >
              <motion.div
                initial={{ translateY: 100 }}
                animate={{ translateY: 0 }}
                exit={{ translateY: -50 }}
                transition={{
                  duration: 0.5,
                  type: "spring",
                  bounce: 0.3,
                }}
                className="w-fit h-fit bg-white p-5 relative pt-14 rounded-lg shadow-md"
              >
                <div
                  className="absolute top-2 right-2 cursor-pointer"
                  onClick={() => onClose()}
                >
                  <XMark_Svg classname="w-6 h-6  fill-black1" />
                </div>
                {children}
              </motion.div>
            </motion.div>,
            document.body
          )
        : null}
    </>
  );
}
