"use client";
import Link from "next/link";
import React from "react";
import Products from "./Products";

interface Props {
  route?: string;
}
export default function AdminDashboard({ route }: Props) {
  console.log(route);
  return (
    <section className="flex flex-row w-full p-10 ">
      <div className="bg-gray-100  p-5 w-[200px] rounded-lg flex flex-col items-center ">
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
        </div>
      </div>
      <div>{route === "products" ? <Products /> : null}</div>
    </section>
  );
}
