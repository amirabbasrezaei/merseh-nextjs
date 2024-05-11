import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Check, Chevron_Down, Plus_Svg } from "../SVGS";
import { categoryType } from "./Filter";
import { AnimatePresence, motion } from "framer-motion";
import classNames from "classnames";
import { filterTypeArgs } from "./Products";
import { trpc } from "@/utils/trpc";
import GetCategories from "./GetCategories";
interface Props {
  name: string;
  subCategory?: categoryType[];
  setFilter: Dispatch<SetStateAction<filterTypeArgs>>;
  catId: number;
  isAddProductPage?: boolean;
}

export default function Category({
  name,
  subCategory = [],
  setFilter,
  catId,
  isAddProductPage,
}: Props) {
  const [showCategory, setShowCategory] = useState(false);

  return (
    <div className=" ">
      <div
        onClick={() => setShowCategory((state) => !state)}
        className="flex flex-row items-center gap-1  w-fit  mb-3"
      >
        {subCategory?.length ? (
          <Chevron_Down classname="w-3 fill-black1 h-3" />
        ) : null}
        <span
          onClick={() =>
            setFilter((state) => ({
              ...state,
              categoryId: catId,
              parentCategories: [Number(catId)],
            }))
          }
          className="text-[13px] text-black1 cursor-pointer"
        >
          {name}
        </span>
        {isAddProductPage ? (
          <Plus_Svg classname="w-[14px] h-auto fill-black1 " />
        ) : null}
      </div>

      <motion.div
        initial={{ scale: 0, height: 0 }}
        animate={{
          scale: showCategory ? 1 : 0,
          opacity: showCategory ? 1 : 0,
          height: showCategory ? "fit-content" : 0,
        }}
        style={{ originX: 1, originY: 0.5 }}
        transition={{ damping: 1 }}
        className="pr-4 flex-col mb-5"
      >
        {/* <span>afdf</span> */}
        {subCategory?.length ? (
          <GetCategories
            data={subCategory}
            parentAnimation={showCategory}
            catId={[catId]}
            setFilter={setFilter}
            isAddProductPage={isAddProductPage}
          />
        ) : null}
      </motion.div>
    </div>
  );
}
