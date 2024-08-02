import { trpc } from "@/utils/trpc";
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { motion } from "framer-motion";
import { filterTypeArgs } from "./Products";
import { Filter_Svg, Magnifier } from "../SVGS";
import Categories from "./Categories";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import useWindowSize from "../useWindowSize";
import { createPortal } from "react-dom";
import Button from "../Button";
interface Props {
  setFilter: Dispatch<SetStateAction<filterTypeArgs>>;
  filter: filterTypeArgs;
}
export interface categoryType {
  id: number;
  title: string;
  parentCategoryId: number | null;
  subCategories?: any[] | undefined;
  insertedIntoParent?: boolean | undefined;
  englishTitle: string;
  content: any;
}
[];

export default function Filter({ setFilter, filter }: Props) {
  const [showFilter, setShowFilter] = useState(false);
  const { height } = useWindowSize();

  const animation = {
    open: { translateY: 0, opacity: 1 },
    closed: { translateY: height, opacity: 0 },
  };

  const searchParams = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  return (
    <div className="relative">
      <div
        onClick={() => setShowFilter(true)}
        className="flex sm:hidden flex-row items-center gap-1 bg-gray-50 rounded-[10px] w-fit px-3 py-2"
      >
        <Filter_Svg classname="w-5 stroke-black1 " />
        <span className="text-[12px] text-black1">فیلتر</span>
      </div>
      <div className="sm:basis-3/12 flex-col gap-10 w-full hidden sm:flex">
        <div className="  h-[40px] px-5 items-center justify-right w-[80%] flex flex-row bg-[#F6F6F6]  rounded-[10px]">
          <Magnifier classname="w-[18px] " />
          <input
            value={filter.searchTerm}
            onChange={(e) => {
              e.preventDefault();
              router.push(
                path + "?" + createQueryString("searchTerm", e.target.value)
              );
            }}
            type="text"
            placeholder="جستجو در میان محصولات زیر"
            className="bg-transparent  h-full placeholder:text-[13px] w-full text-black1 placeholder:text-[#8b8b8b]  pr-2  appearance-none outline-none"
          />
        </div>
        <Categories setFilter={setFilter} />
        <Button
          onClick={() => {
            setFilter((state) => ({ ...state, needRefetch: true }));
          }}
          style={{ width: 200 }}
          text="اعمال"
        />
      </div>

      <motion.div
        transition={{ type: "tween", duration: 0.3 }}
        variants={animation}
        initial={false}
        animate={showFilter ? "open" : "closed"}
        className="sm:basis-3/12 bg-white z-20 p-5 justify-between fixed h-full top-0 right-0 left-0 flex-col gap-10 w-full  flex"
      >
        <div className="flex flex-col gap-10">
          <div className="  h-[40px] px-5 items-center justify-right w-full flex flex-row bg-[#F6F6F6]  rounded-[10px]">
            <Magnifier classname="w-[18px] " />
            <input
              value={filter.searchTerm}
              onChange={(e) => {
                e.preventDefault();
                router.push(
                  path + "?" + createQueryString("searchTerm", e.target.value)
                );
              }}
              type="text"
              placeholder="جستجو در میان محصولات زیر"
              className="bg-transparent  h-full placeholder:text-[13px] w-full text-black1 placeholder:text-[#8b8b8b]  pr-2  appearance-none outline-none"
            />
          </div>
          <Categories setFilter={setFilter} />
        </div>
        <div className="w-full flex flex-row gap-5">
          <Button
            className="w-[40%]  text-[#3a3a3a] bg-[#ededed]"
            text="بستن"
            onClick={() => setShowFilter(false)}
          />
          <Button onClick={() => setShowFilter(false)} text="اعمال فیلتر" />
        </div>
      </motion.div>
    </div>
  );
}
