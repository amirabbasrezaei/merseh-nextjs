import type { Metadata } from "next";
import "./globals.css";
import "contenido/dist/styles.css";
import TRPC_Provider from "@/Components/TRPC_Provider";
import { IRANYekanXFaNum } from "./fonts";
import RecoilRootProvider from "@/Components/StateManager/RecoilRootProvider";
import { cookies } from "next/headers";
import ThemeController from "@/Components/ThemeController";
import { Toaster } from "react-hot-toast";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import Script from "next/script";

import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: {
    default: "فروشگاه مرسه",
    template: "%s  - مرسه",

  },
  description:
    "مرسه تولید کننده انواع محصولات طبیعی شامل روغنهای گیاهی مانند روغن زیتون، روغن کنجد، روغن آفتابگردان، روغن سیاه دانه، کره گیاهی، ارده و ... می‌باشد.",
  alternates: {
    canonical: `${process.env.BASE_URL}`,

  },
  metadataBase: new URL("https://merseh.com"),
  robots: { follow: true, index: true },
  openGraph: {
    locale: "fa_IR",
    siteName: "مرسه",
    type: "website",
    countryName:"IRAN",
    
  },
  other: {
    currency: "IRT",
    lang: "fa",
    "theme-color": "#00A573",
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
        <>
          <Script
          id="gtag"
            strategy="afterInteractive"
            src="https://www.googletagmanager.com/gtag/js?id=GTM-T83BTZM4"
          />
          <Script id="gtag1" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'GTM-T83BTZM4');`}
          </Script>
        </>
      ) : null}
      <body
        className={`overflow-x-hidden  ${IRANYekanXFaNum.className}`}
      >
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
