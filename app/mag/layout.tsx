import { Metadata } from "next";
import { SITE_NAME } from "@/utils/site";

const magazineName = `مجله ${SITE_NAME}`;

export const metadata: Metadata = {
  title: {
    default: magazineName,
    template: `%s - ${magazineName}`,
  },
  description:
    `${magazineName} کاربردی ترین و جدیدترین موضوعات مربوط به حوزه سلامتی، محصولات طبیعی و ارگانیک را منتشر می‌کند`,
  alternates: {
    canonical: `${process.env.BASE_URL}/mag`,
  },
  metadataBase: new URL("https://mehrnil.com/mag"),
  robots: { follow: true, index: true },
  openGraph: {
    locale: "fa_IR",
    siteName: magazineName,
    type: "article",
    authors: magazineName,
  },
  other: {
    currency: "IRT",
    lang: "fa",
    "theme-color": "#00A573",
  },
};

export default function MagLayout({ children }: { children: React.ReactNode }) {
  return <>
  
  {children}
  </>;
}
