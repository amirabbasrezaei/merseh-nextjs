import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import "contenido/dist/styles.css";
import TRPC_Provider from "@/Components/TRPC_Provider";
import { IRANYekanXFaNum } from "./fonts";
import RecoilRootProvider from "@/Components/StateManager/RecoilRootProvider";
import { cookies } from "next/headers";
import ThemeController from "@/Components/ThemeController";
import { Toaster } from "react-hot-toast";
import { GoogleTagManager } from "@next/third-parties/google";
import { GoogleAnalytics } from "@next/third-parties/google";

export const metadata: Metadata = {
  title: {
    default: "فروشگاه مرسه",
    template: "%s  -  فروشگاه مرسه",
  },
  description: "خرید محصولات کاملا طبیعی و ارگانیک در مرسه",
  alternates: {
    canonical: `${process.env.BASE_URL}`,
  },
  metadataBase: new URL("https://merseh.com"),
  robots: { follow: true, index: true },
  openGraph: {
    locale: "fa_IR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const AuthorizeStatus = cookies().get("AuthorizeStatus")?.value;
  console.log(AuthorizeStatus);
  return (
    <html lang="en" dir="rtl">
      <head>
        <meta charSet="utf-8" />
      </head>
      {process.env.NODE_ENV === "production" ? (
        <GoogleTagManager gtmId="GTM-T83BTZM4" />
      ) : null}
      <body
        className={`overflow-x-hidden  bg-white ${IRANYekanXFaNum.className}`}
      >
        <Analytics />
        <SpeedInsights />
        <Toaster />
        <RecoilRootProvider>
          <TRPC_Provider>
            <ThemeController AuthorizeStatus={AuthorizeStatus}>
              {children}
            </ThemeController>
          </TRPC_Provider>
        </RecoilRootProvider>
      </body>
      {process.env.NODE_ENV === "production" ? (
        <GoogleAnalytics gaId="G-DD1SELQY4Y" />
      ) : null}
    </html>
  );
}
