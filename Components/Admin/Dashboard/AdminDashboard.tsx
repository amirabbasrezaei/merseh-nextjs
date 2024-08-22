"use client";
import Link from "next/link";
import React from "react";
import Products from "./Products";
import Articles from "./Articles";
import Categories from "./Categories/Categories";

import { Merseh_nastaliq } from "@/Components/SVGS";
import classNames from "classnames";
import Comments from "./Comments/Comments";

interface Props {
  route?: string;
}

export default function AdminDashboard({ route }: Props) {
 
  return (
    <section className="flex flex-col w-full p-10 gap-10">
      <div className="flex flex-row items-center gap-4 ">
        <h1 className="text-[20px] font-[500] text-gray-600">پنل مدیریت</h1>
        <Merseh_nastaliq classname="h-9 w-auto fill-green2" />
      </div>
      <div className="flex flex-row gap-10">
        <div className="bg-gray-50 h-fit  p-5 basis-2/12 rounded-lg flex flex-col items-center ">
          <div className="flex flex-col gap-6">
            <Link href={"/admin/products"}>
              <span
                className={classNames(
                  "text-gray-600 ",
                  route === "products" ? "font-[600] text-green2" : "text-gray-600 font-[500]"
                )}
              >
                محصول‌ها
              </span>
            </Link>
            <Link href={"/admin/articles"}>
              <span
                className={classNames(
                  
                  route === "articles" ? "font-[600] text-green2" : "text-gray-600 font-[500]"
                )}
              >
                مقاله‌ها
              </span>
            </Link>
            <Link href={"/admin/categories"}>
              <span
                className={classNames(
                  
                  route === "categories" ? "font-[600] text-green2" : "text-gray-600 font-[500]"
                )}
              >
                دسته‌بندی‌ها
              </span>
            </Link>
            <Link href={"/admin/comments"}>
              <span
                className={classNames(
                  
                  route === "comments" ? "font-[600] text-green2" : "text-gray-600 font-[500]"
                )}
              >
                دیدگاه‌ ها
              </span>
            </Link>
          </div>
        </div>
        <div className="basis-10/12 ">
          {route === "products" ? (
            <Products />
          ) : route === "articles" ? (
            <Articles />
          ) : route === "categories" ? (
            <Categories />
          ) : route === "comments" ? (
            <Comments />
          ) : null}
        </div>
      </div>
    </section>
  );
}
