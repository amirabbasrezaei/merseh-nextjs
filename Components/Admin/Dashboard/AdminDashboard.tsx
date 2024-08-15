"use client";
import Link from "next/link";
import React from "react";
import Products from "./Products";
import Articles from "./Articles";
import Categories from "./Categories";
import Comments from "./Comments";

interface Props {
  route?: string;
}
export default function AdminDashboard({ route }: Props) {
  console.log(route);
  return (
    <section className="flex flex-row w-full p-10 gap-10">
      <div className="bg-gray-100 h-fit  p-5 basis-2/12 rounded-lg flex flex-col items-center ">
        <div className="flex flex-col gap-5">
          <Link href={"/admin/products"}>
            <span className="text-gray-600">محصول‌ها</span>
          </Link>
          <Link href={"/admin/articles"}>
            <span className="text-gray-600">مقاله‌ها</span>
          </Link>
          <Link href={"/admin/categories"}>
            <span className="text-gray-600">دسته‌بندی‌ها</span>
          </Link>
          <Link href={"/admin/comments"}>
            <span className="text-gray-600">دیدگاه‌ ها</span>
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
    </section>
  );
}
