import React from "react";
import Header from "../Home/Header";
import { IRANYekanXFaNum } from "@/app/fonts";
import Footer from "../Footer";

interface props {
  children: React.ReactNode;
}

export default function Layout({ children }: props) {
  return (
    <main
      className={`justify-center items-center pb-10 flex  bg-white w-screen overflow-x-hidden overflow-y-visible h-screen`}
    >
      <div className="max-w-[1400px]   gap-16 w-full flex-col  items-center flex overflow-y-visible bg-white h-full ">
        <Header />
        <div className=" w-full grow  flex flex-col gap-16">
          <div className="min-h-[1100px]">{children}</div>
          <div className="h-[253px]">
            <Footer />
          </div>
        </div>
      </div>
    </main>
  );
}
