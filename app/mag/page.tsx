import Articles from "@/Components/Article/Articles";
import Layout from "@/Components/Layout/Layout";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: { absolute: "مجله مرسه" },
  description:
    " مجله مرسه کاربردی ترین و جدیدترین موضوعات مربوط به حوزه سلامتی، محصولات طبیعی و ارگانیک را منتشر می‌کند",
  alternates: {
    canonical: `${process.env.BASE_URL}/mag`,
  },
  metadataBase: new URL(`${process.env.BASE_URL}/mag`),
  robots: { follow: true, index: true },
  openGraph: {
    locale: "fa_IR",
    type: "article",
  },
};

export default function page() {
  return (
    <Layout>
      <Articles />
    </Layout>
  );
}
