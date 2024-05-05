import { IRANYekanXFaNum } from "@/app/fonts";
import React from "react";
interface Props {
  children: React.ReactNode;
}
export default function Layout_Empty({ children }: Props) {
  return <main className={`w-screen h-screen flex items-center justify-center bg-white`}>{children}</main>;
}
