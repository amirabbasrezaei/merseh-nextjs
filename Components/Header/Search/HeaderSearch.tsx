import { Magnifier } from "@/Components/SVGS";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/utils/trpc";
import Link from "next/link";

const animation = {
  open: {
    height: 300,
    opacity: 1,
  },
  hidden: {
    height: 0,
    opacity: 0,
  },
};

export default function HeaderSearch() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { data, isPending, mutate } = trpc.filter.search.useMutation();

  useEffect(() => {
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

  console.log(data?.result);

  return (
    <div className=" grow h-[50px] relative flex items-center justify-center">
      <div className="relative w-full h-full z-10">
        <input
          value={searchTerm}
          placeholder="جستجو در میان محصولات"
          className="bg-[#F6F6F6] absolute  w-full h-full placeholder:text-[15px] text-black1 placeholder:text-[#8b8b8b] px-5 pr-[50px] grow rounded-[10px] appearance-none outline-none"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Magnifier classname="absolute top-[15px] right-[15px] w-[20px] h-auto" />
      </div>
      <motion.div
        initial={false}
        style={{ overflow: "hidden" }}
        variants={animation}
        animate={searchTerm.length ? "open" : "hidden"}
        className="absolute  flex flex-col justify-evenly  bg-white w-[104%] z-[1] p-5 pt-20 rounded-[10px] border top-[-15px]"
        transition={{ duration: 0.5 }}
      >
        {data?.result.length
          ? data.result.map((item, index) => (
              <Link
                onClick={() => setSearchTerm("")}
                href={`/products?catId=${item.id}`}
                key={index}
              >
                <span>{item.title}</span>
              </Link>
            ))
          : null}
      </motion.div>
    </div>
  );
}
