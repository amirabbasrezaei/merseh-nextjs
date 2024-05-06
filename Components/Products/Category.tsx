import { useEffect, useState } from "react";
import { Chevron_Down } from "../Home/SVGS";
import { categoryType } from "./Categories";
import { AnimatePresence, motion } from "framer-motion";
import classNames from "classnames";
interface Props {
  name: string;
  subCategory?: categoryType[];
}

export default function Category({ name, subCategory = [] }: Props) {
  const [showCategory, setShowCategory] = useState(false);

  const getCategories = (data: categoryType[], parentAnimation: boolean) => {
    if (data.length < 1) {
      return;
    }
    const [showSubCategory, setShowSubCategory] = useState(false);

    return data.map((cat: categoryType) => (
      <motion.div   className="   ">
        <div
          onClick={(e) => {
            setShowSubCategory(state => !state);
            e.stopPropagation();
          }}
          className="flex flex-row gap-1 items-center  mb-3"
        >
          {cat.subCategories?.length ? (
            <Chevron_Down classname="w-3 fill-black1 h-3" />
          ) : null}
          <span className={classNames("text-[13px] text-black1 cursor-poiner" , cat.subCategories?.length ?  "" : "mr-3" )}>{cat.title}</span>
        </div>

        {cat.subCategories?.length ? (
          <motion.div
            animate={{ scale: showSubCategory ? 1 : 0, opacity: showSubCategory ? 1 : 0, height:showSubCategory? "fit-content" : 0  }}
            className="pr-4  flex-col mt-3"
            style={{ originX: 1, originY: 0.5 }}
          >
            {getCategories(cat.subCategories as categoryType[], parentAnimation)}
          </motion.div>
        ) : null}
      </motion.div>
    ));
  };

  return (
    <div className=" ">
      <div
        onClick={() => setShowCategory((state) => !state)}
        className="flex flex-row items-center gap-1  w-fit  mb-3"
      >
        {subCategory?.length ? (
          <Chevron_Down classname="w-3 fill-black1 h-3" />
        ) : null}
        <span className="text-[13px] text-black1 cursor-pointer">{name}</span>
      </div>

      <motion.div
      dir="rtl"
      initial={{scale: 0, height:0}}
        animate={{ scale: showCategory ? 1 : 0, opacity: showCategory ? 1 : 0, height:showCategory? "fit-content" : 0 }}
        style={{ originX: 1, originY: 0.5 }}
        transition={{damping: 1}}
        
        className="pr-4 flex-col mb-5"
      >
        {/* <span>afdf</span> */}
        {subCategory?.length ? getCategories(subCategory, showCategory) : null}
      </motion.div>
    </div>
  );
}
