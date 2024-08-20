"use client";
import { Category_Svg, Magnifier, XMark_Svg } from "@/Components/SVGS";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import classNames from "classnames";
import useWindowSize from "@/Components/useWindowSize";

const animation = {
  open: {
    height: 300,
    opacity: 1,
    zIndex: 20,
  },
  hidden: {
    height: 0,
    opacity: 0,
    zIndex: 10,
  },
};

export default function HeaderSearch() {
  const [isClient, setisClient] = useState(false);
  const { height } = useWindowSize();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { data, isLoading, mutate } = trpc.filter.search.useMutation();
  // for mobile purpose
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    setisClient(true);
    let timeOut: any;
    if (searchTerm.length) {
      timeOut = setTimeout(() => {
        mutate({ text: searchTerm });
      }, 500);
    }

    return () => {
      clearTimeout(timeOut);
    };
  }, [searchTerm]);



  return (
    <>
      <div className="hidden basis-6/12 h-[50px] relative sm:flex items-center justify-center">
        <div
          className={classNames(
            "relative w-full h-full",
            searchTerm.length ? "z-30" : "z-20"
          )}
        >
          <input
            value={searchTerm}
            placeholder="جستجو در میان کالاها"
            className="bg-[#F6F6F6] absolute   w-full h-full placeholder:text-[15px] text-black1 placeholder:text-[#8b8b8b] px-5 pr-[50px] grow rounded-[10px] appearance-none outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Magnifier classname="absolute top-[15px] right-[15px] w-[20px] h-auto fill-[#363636]" />
        </div>
        <motion.div
          initial={false}
          style={{ overflow: "hidden" }}
          variants={animation}
          animate={searchTerm.length ? "open" : "hidden"}
          className="absolute gap-5 flex flex-col justify-evenly overflow-y-scroll  bg-white w-[104%] z-[1]  pt-20 rounded-[10px] border top-[-15px]"
          transition={{ duration: 0.3 }}
        >
          <div
            style={{ scrollbarWidth: "thin" }}
            className="h-full flex flex-col overflow-y-scroll p-5 pt-0 gap-3 scroll"
          >
            {data?.result.length
              ? data.result.map((item, index) => (
                  <Link
                    onClick={() => setSearchTerm("")}
                    href={`/category/${item.id}/${item.title.replaceAll(" ", "-")}`}
                    key={index}
                    className="flex flex-row items-center gap-2"
                  >
                    <div>
                      <Category_Svg classname="w-5 fill-gray-300" />
                    </div>
                    <span className="text-black1">{item.title}</span>
                  </Link>
                ))
              : null}
          </div>
        </motion.div>

        {isClient
          ? createPortal(
              <motion.div
                onClick={() => setSearchTerm("")}
                initial={false}
                animate={
                  searchTerm.length
                    ? { opacity: 1, backdropFilter: "blur(2px)", scale: 1 }
                    : { opacity: 0, backdropFilter: "blur(0px)", scale: 0 }
                }
                className="fixed z-10 w-full h-full "
              ></motion.div>,
              document.body
            )
          : null}
      </div>
      <div
        onClick={() => setShowSearch(true)}
        className="flex sm:hidden items-center justify-center h-full w-fit"
      >
        <Magnifier classname=" w-[20px] h-auto fill-[#363636]" />
      </div>

      {isClient && showSearch
        ? createPortal(
            <motion.div
              initial={false}
              animate={
                showSearch
                  ? { translateY: 0, opacity: 1 }
                  : { translateY: 500, opacity: 0 }
              }
              transition={{ bounce: 0.2, type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 left-0 items-center py-6 w-full h-full origin-bottom bg-white z-30 flex flex-col gap-2"
            >
              {showSearch ? (
                <input
                  value={searchTerm}
                  placeholder="جستجو در میان کالاها"
                  autoFocus
                  className="bg-[#F6F6F6]  z-30  w-[90%] h-[50px]  placeholder:text-[15px] text-black1 placeholder:text-[#8b8b8b] px-5  rounded-[10px] appearance-none outline-none"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              ) : null}
              <div
                // style={{ overflow: "hidden" }}
                className=" flex flex-col h-full overflow-y-scroll bg-white w-full gap-5 p-5 sm:pt-20"
              >
                {data?.result.length
                  ? data.result.map((item, index) => (
                      <Link
                        onClick={() => {
                          setSearchTerm("");
                          setShowSearch(false);
                        }}
                        href={`/category/${item.id}/${item.title}`}
                        key={index}
                        className="bg-gray-50 rounded-[8px] gap-3 p-4 flex flex-row items-center"
                      >
                        <Category_Svg classname="w-4 h-auto stroke-lightBlack" />
                        <span className="text-black1 text-[14px] font-[400]">
                          {item.title}
                        </span>
                      </Link>
                    ))
                  : null}
                <div
                  onClick={() => {
                    setShowSearch(false);
                    setSearchTerm("");
                  }}
                  className="absolute bottom-[20px] px-3 gap-1 py-1 rounded-[8px] bg-red-50 flex flex-row items-center right-3 z-30 w-fit h-fit"
                >
                  <XMark_Svg classname="w-4 h-auto fill-red-400" />
                  <span className="text-[18px] text-black1">بستن</span>
                </div>
              </div>
            </motion.div>,
            document.body
          )
        : null}
    </>
  );
}
