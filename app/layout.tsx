import type { Metadata } from "next";
import "./globals.css";
import TRPC_Provider from "@/Components/TRPC_Provider";
import { IRANYekanXFaNum } from "./fonts";
import { cookies } from "next/headers";
import ThemeController from "@/Components/ThemeController";
import { Toaster } from "react-hot-toast";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import Script from "next/script";
import { SITE_NAME } from "@/utils/site";

export const metadata: Metadata = {
  title: {
    default: `فروشگاه ${SITE_NAME}`,
    template: `%s - ${SITE_NAME}`,
  },
  description:
    `${SITE_NAME} تولید کننده انواع محصولات طبیعی شامل روغنهای گیاهی مانند روغن زیتون، روغن کنجد، روغن آفتابگردان، روغن سیاه دانه، کره گیاهی، ارده و ... می‌باشد.`,
  alternates: {
    canonical: `${process.env.BASE_URL}`,
  },
  metadataBase: new URL("https://mehrnil.com"),
  robots: { follow: true, index: true },
  openGraph: {
    locale: "fa_IR",
    siteName: SITE_NAME,
    type: "website",
    countryName: "IRAN",
  },
  other: {
    currency: "IRT",
    lang: "fa",
    "theme-color": "#3B2330",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const AuthorizeStatus = cookieStore.get("AuthorizeStatus")?.value;
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
      <body className={`overflow-x-hidden  ${IRANYekanXFaNum.className}`}>
        <Toaster />
        <TRPC_Provider>
          <ThemeController AuthorizeStatus={AuthorizeStatus}>
            {children}
          </ThemeController>
        </TRPC_Provider>
      </body>

     

      {process.env.NODE_ENV === "production" ? (
        <>
         <Script
        id="goftino-widget"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `!function(){var i="tZh0Ld",a=window,d=document;function g(){var g=d.createElement("script"),s="https://www.goftino.com/widget/"+i,l=localStorage.getItem("goftino_"+i);g.async=!0,g.src=l?s+"?o="+l:s;d.getElementsByTagName("head")[0].appendChild(g);}"complete"===d.readyState?g():a.attachEvent?a.attachEvent("onload",g):a.addEventListener("load",g,!1);}();`,
        }}
      />
          <GoogleAnalytics gaId="G-DD1SELQY4Y" />
        </>
      ) : null}
    </html>
  );
}
