import React from "react";
import {
  Instagram_SVG,
  Location_Pin,
  Merseh_nastaliq,
  MersehSvg,
  Phone_SVG,
  Telegram_SVG,
} from "./SVGS";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="h-fit  max-w-[1400px] relative w-full items-center justify-around flex flex-col py-16 px-10 gap-10 bg-white   ">
      <hr className="w-full left-0 right-0 absolute top-0 " />
      <div className="w-full flex flex-col sm:flex-row ">
        <div className="basis-1/3 flex flex-col   h-full mt-5 sm:mt-0 justify-evenly items-start ">
          <Merseh_nastaliq classname="w-20 h-auto mb-8" />
          <h3 className="text-[20px] font-[500] text-[#515151] mb-5">
            ارتباط با ما
          </h3>
          <div className="flex flex-col gap-6">
            <div className="flex flex-row gap-2 items-center">
              <Phone_SVG classname="w-6 h-6 -rotate-[10deg] fill-[#303030]" />
              <span className="text-[20px] text-[#303030]">
                <a href="tel:02191694827">021-91694827</a>
              </span>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <Location_Pin classname="w-6 h-6 fill-green2" />
              <p className="text-[14px] text-[#303030]">
                <strong>آدرس شعبه 1:</strong> تهران، میدان تجریش، خیابان دربندی،
                پلاک 118
              </p>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <Location_Pin classname="w-6 h-6 fill-green2" />
              <p className="text-[14px] text-[#303030]">
                <strong>آدرس شعبه 2:</strong> استان مرکزی، شهر محلات، خیابان
                شهید قندی، جنب امامزاده فضل و یحیی
              </p>
            </div>
          </div>
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
      </div>
      <div className="h-fit flex flex-row items-center gap-8">
        <Instagram_SVG classname="w-6" />
        <Telegram_SVG classname="w-6" />
      </div>
      <span>
        طراحی شده توسط <span className="font-[700]">Merseh</span>
      </span>
    </footer>
  );
}
