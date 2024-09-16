import { trpc } from "@/utils/trpc";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useAnimation, motion, AnimationProps } from "framer-motion";
import { useInView } from "react-intersection-observer";
export default function MersehMag() {
  const { data } = trpc.article.recentArticles.useQuery();
  const [ref, inView] = useInView();
  const controls = useAnimation();
  const animationVariants: AnimationProps["variants"] = {
    hidden: {
      translateY: 200,
      translateX: 200,
      transition: { duration: 0.3 },
      opacity:0
    },
    active: {
      translateY: 0,
      translateX: 0,
      transition: { duration: 0.3, type: "spring", bounce: 3, damping:10 },
      opacity:1
    },
  };
  useEffect(() => {
    if (inView) {
      controls.start("active");
    }
  }, [inView]);

  return (
    <div className="w-full mt-10 mb-16 md:my-10 flex flex-col items-center justify-between  md:gap-14 relative md:h-[550px] h-fit">
      <Link href={"/mag"} aria-label="مجله مرسه" className="h-fit">
        <div className="flex flex-row gap-1 items-center z-10 py-6 justify-center h-fit">
          <svg
            width="11"
            height="22"
            viewBox="0 0 11 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse cx="5.5" cy="11" rx="5.5" ry="11" fill="#00A573" />
          </svg>
          <span className="text-[#4a4a4a] font-[800] text-[22px]">
            مجله مرسه
          </span>
        </div>
      </Link>
      <motion.div className="grid md:grid-cols-2 md:grid-rows-2 grid-cols-1 w-full h-full z-10 gap-5  relative">
        <motion.div
          ref={ref}
          variants={animationVariants}
          initial={"hidden"}
          animate={controls}
          className="absolute md:rotate-0 md:right-0 md:-bottom-16 rotate-[40deg] w-[1300px] bottom-[150px] -right-[350px] md:w-full md:h-auto  h-auto hidden lg:block"
        >
          <svg
            className="w-full "
            viewBox="0 0 1398 615"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M168.035 61.163C194.649 15.8701 247.269 -7.29979 298.649 3.65021L1300.55 217.174C1374.19 232.868 1416.17 310.864 1388.72 380.974L1327.47 537.419C1307.47 588.494 1255.85 619.945 1201.29 614.289L109.734 501.134C21.4072 491.978 -27.8592 394.537 17.1285 317.977L168.035 61.163Z"
              fill="#00A573"
            />
          </svg>
        </motion.div>
        {data?.recentArticles?.length ? (
          data.recentArticles.map((article) => (
            <Link
            key={article.id}
              href={`/mag/${article.id}/${(article.englishTitle || article.title).replaceAll(" ", "-")}`}
              className="w-full flex-row p-4 gap-4 justify-between shadow-lg md:shadow-md bg-white bg-opacity-80 h-full backdrop-blur-lg rounded-[34px] items-center flex  z-10 "
            >
              <h2 className="font-[600] text-[#303030] text-[16px]  md:text-[18px] xl:text-[22px]">
                {article.title}
              </h2>
              <Image
                className="md:w-[180px] md:h-[180px] h-[120px] w-[120px] rounded-[20px] md:rounded-[34px]"
                style={{ objectFit: "cover" }}
                alt={article.images[0]?.split('/')?.at(-1)?.split(".")?.at(0) || ""}
                src={article.images[0]}
                width={300}
                height={300}
              />
            </Link>
          ))
        ) : (
          <div></div>
        )}
      </motion.div>
    </div>
  );
}
