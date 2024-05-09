import type { Metadata } from "next";
import "./globals.css";
import TRPC_Provider from "@/Components/TRPC_Provider";
import { IRANYekanXFaNum } from "./fonts";
import RecoilRootProvider from "@/Components/StateManager/RecoilRootProvider";
import { cookies } from "next/headers";
import ThemeController from "@/Components/ThemeController";


export const metadata: Metadata = {
  title: "Merseh",
  description: "محصولات ارگانیک مرسه",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const AuthorizeStatus = cookies().get("AuthorizeStatus")?.value;
  return (
    <html lang="en" dir="rtl">
      <body
        className={`overflow-x-hidden bg-white ${IRANYekanXFaNum.className}`}
      >
        <RecoilRootProvider>
          <TRPC_Provider>
            <ThemeController AuthorizeStatus={AuthorizeStatus}>{children}</ThemeController>
          </TRPC_Provider>
        </RecoilRootProvider>
        {/* <Footer /> */}
      </body>
    </html>
  );
}
