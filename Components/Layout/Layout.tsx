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
      className={`justify-center items-center flex  bg-white w-screen overflow-hidden `}
    >
        <div className="max-w-[1400px] gap-16 w-full flex-col justify-center items-center flex bg-white">
      <Header />
      {children}
      <Footer />
      </div>
    </main>
  );
}
