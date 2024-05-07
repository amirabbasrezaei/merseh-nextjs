import { trpc } from "@/utils/trpc";
import React, { Dispatch, SetStateAction, useState } from "react";
import Category from "./Category";
import { filterTypeArgs } from "./Products";
import { Magnifier } from "../Home/SVGS";
import Categories from "./Categories";
interface Props {
  setFilter: Dispatch<SetStateAction<filterTypeArgs>>;
  filter: filterTypeArgs;
}
export interface categoryType {
  id: string;
  title: string;
  parentCategoryId: string | null;
  subCategories?: any[] | undefined;
  insertedIntoParent?: boolean | undefined;
}
[];

export default function Filter({ setFilter, filter }: Props) {
  return (
    <div className="basis-3/12 flex flex-col gap-10">
      <div className="  h-[40px] px-5 items-center justify-right w-[80%] flex flex-row bg-[#F6F6F6]  rounded-[10px]">
        <Magnifier classname="w-[18px] " />
        <input
          value={filter.searchTerm}
          onChange={(e) => {
            e.preventDefault();
            setFilter((state) => ({
              categoryId: state.categoryId,
              searchTerm: e.target.value,
            }));
          }}
          type="text"
          placeholder="جستجو در میان محصولات زیر"
          className="bg-transparent  h-full placeholder:text-[13px] w-full text-black1 placeholder:text-[#8b8b8b]  pr-2  appearance-none outline-none"
        />
      </div>
      <Categories setFilter={setFilter} />
    </div>
  );
}
