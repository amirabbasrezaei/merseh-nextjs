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

const Header = dynamic(() => import("../Header/Header"), { ssr: true });
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
        {/* The header must stay a direct child of this scroller for `position: sticky` to hold. */}
        <motion.main
          style={{ direction: "ltr" }}
          className="flex h-screen w-screen flex-col items-center overflow-x-hidden bg-white supports-[height:100dvh]:h-dvh"
        >
          {header ? <Header /> : null}
          <div
            style={{ direction: "rtl" }}
            className={classNames(
              "flex max-w-[1400px] flex-1 flex-col items-center bg-white pb-[calc(env(safe-area-inset-bottom)+6rem)] sm:w-full sm:pb-0",
              fullWidth ? "w-full" : "w-[90%]",
            )}
          >
            <Navbar />

            <div className="flex w-full grow flex-col gap-16 pt-4 sm:pt-6">
              <div className="grow">{children}</div>
              {footer ? <Footer /> : null}
            </div>
          </div>
        </motion.main>
      </Suspense>
      <ProgressBar
        shallowRouting
        options={{ showSpinner: false }}
        height="4px"
        color="#8A4A55"
      />
    </>
  );
}
