import type { Metadata } from "next";
import "./globals.css";
import TRPC_Provider from "@/Components/TRPC_Provider";
import { IRANYekanXFaNum } from "./fonts";
import { AnimatePresence } from "framer-motion";








export const metadata: Metadata = {
  title: "Merseh",
  description: "محصولات ارگانیک مرسه",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="rtl">
      <body className={`overflow-x-hidden bg-white ${IRANYekanXFaNum.className}`} >
    
        <TRPC_Provider>{children}</TRPC_Provider>
        {/* <Footer /> */}
      </body>
    </html>
  );
}
