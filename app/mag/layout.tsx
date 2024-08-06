import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "مجله مرسه",
    template: "%s  -  مجله مرسه",

  },
  description:
    "مجله مرسه کاربردی ترین و جدیدترین موضوعات مربوط به حوزه سلامتی، محصولات طبیعی و ارگانیک را منتشر می‌کند",
  alternates: {
    canonical: `${process.env.BASE_URL}`,

  },
  metadataBase: new URL("https://merseh.com/mag"),
  robots: { follow: true, index: true },
  openGraph: {
    locale: "fa_IR",
    siteName: "مجله مرسه",
    type: "article",
    authors: "مجله مرسه",
  },
  other: {
    currency: "IRT",
    lang: "fa",
    "theme-color": "#00A573"
  },

};

export default function MagLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
