import React from "react";
import { MersehSvg } from "./SVGS";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="h-full  max-w-[1400px] relative w-full items-center flex flex-row px-5 bg-white   ">
      <hr className="w-full left-0 right-0 absolute top-0" />
      <div className="basis-1/3 flex flex-col gap-5">
        <MersehSvg classname="w-[38px] h-[38px]" />
        <div className="flex flex-row gap-2">
          <span className="text-[14px] ">تلفن پشتیبانی:</span>
          <span className="text-[14px]">
            <a href="tel:+4733378901">021-26856389</a>
          </span>
        </div>
        <p className="text-[14px]">
          آدرس شعبه 1: تهران، میدان تجریش، خیابان دربندی، پلاک 118
        </p>
        <p className="text-[14px]">
          آدرس شعبه 2: استان مرکزی، شهر محلات، خیابان شهید قندی، جنب امامزاده
          فضل و یحیی
        </p>
      </div>
      <div className="basis-1/3 flex flex-col"></div>
      <div className="basis-1/3 flex flex-col">
        <a
          referrerPolicy="origin"
          target="_blank"
          href="https://trustseal.enamad.ir/?id=491421&Code=nWLgfgtO1aZxbPr2nb6vB7LIjve7BrXw"
        >
          <Image
            referrerPolicy="origin"
            src="https://trustseal.enamad.ir/logo.aspx?id=491421&Code=nWLgfgtO1aZxbPr2nb6vB7LIjve7BrXw"
            alt=""
            style={{ cursor: "pointer" }}
            width={100}
            height={100}
            // code="nWLgfgtO1aZxbPr2nb6vB7LIjve7BrXw"
          />
        </a>
      </div>
    </footer>
  );
}
