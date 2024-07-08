"use client";

import React, { useEffect, useState } from "react";
import Category from "./Category.admin";
import { filterTypeArgs } from "../AddProduct/ProductEdit";
import QuillEditor, { contentType } from "../AddProduct/QuillEditor";
import Button from "@/Components/Button";
import { trpc } from "@/utils/trpc";
import Input from "@/Components/Input";

export interface ManageCategory extends filterTypeArgs {
  name?: string;
  englishName?: string;
  content?: string
}

export default function ManageCategory() {
  const [filter, setFilter] = useState<ManageCategory>({
    name: "",
    englishName: "",
  });
  const [content, setContent] = useState<contentType[]>([]);
  const { isLoading, mutate, data } = trpc.product.editCategory.useMutation();
  useEffect(() => {
    console.log(filter);
  }, [filter]);
  return (
    <section className="flex flex-row items-center h-full w-full px-10 justify-evenly">
      <Category filter={filter} setFilter={setFilter} />
      <div className="flex flex-col items-end gap-6">
        <div className="flex flex-wrap w-full">
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label
              className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              htmlFor="grid-first-name"
            >
              نام
            </label>
            <input
              value={filter.name}
              onChange={(e) => {
                setFilter((state) => ({
                  ...state,
                  name: e.target.value,
                }));
              }}
              className="appearance-none block w-full bg-gray-200 text-gray-700 border  rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="grid-first-name"
              type="text"
            />
          </div>
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label
              className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              htmlFor="grid-eng-name"
            >
              نام انگلیسی
            </label>
            <input
              value={filter.englishName}
              onChange={(e) => {
                  setFilter((state) => ({
                    ...state,
                    englishName: e.target.value,
                  }));
              }}
              className="appearance-none block w-full bg-gray-200 text-gray-700 border  rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="grid-eng-name"
              type="text"
            />
          </div>
        </div>
        <QuillEditor content={content} setContent={setContent} />
        <Button
          onClick={() =>
            filter?.categoryId &&
            mutate({
              categoryId: filter.categoryId,
              content: JSON.stringify(content),
              englishName: filter.englishName || "",
              name: filter.name || "",
            })
          }
          isLoading={isLoading}
          style={{ width: 300 }}
          text="ثبت تغییرات"
        />
      </div>
    </section>
  );
}
