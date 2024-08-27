import React from "react";
import RecentArticles from "./RecentArticles";
import Link from "next/link";

export default function Mag() {
  return (
    <section className="md:px-10 py-[30px] flex flex-col gap-10">
      <div className="w-full flex justify-center relative">
        {/* <hr className="w-full" /> */}
        <h1 className="absolute -top-3 bg-white text-gray-500 px-4">
          مجله مرسه
        </h1>
      </div>
      <RecentArticles />
      <div className="w-full flex items-center justify-center ">
        <link href={`/mag/articles`} className="bg-gray-100 py-3 px-6 rounded-md cursor-pointer">
          <span className="font-[500] text-gray-700">مطالب بیشتر</span>
        </link>
      </div>
    </section>
  );
}
