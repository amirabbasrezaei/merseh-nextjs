
import { Metadata } from "next";
import React from "react";
import MagLayout from "@/Components/Layout/MagLayout";
import Mag from "@/Components/Mag/Mag";
import { SITE_NAME } from "@/utils/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: `مجله ${SITE_NAME}` },
  description:
    `مجله ${SITE_NAME} کاربردی ترین و جدیدترین موضوعات مربوط به حوزه سلامتی، محصولات طبیعی و ارگانیک را منتشر می‌کند`,
  alternates: {
    canonical: `${process.env.BASE_URL}/mag`,
  },
  metadataBase: new URL(`${process.env.BASE_URL}/mag`),
  robots: { follow: true, index: true },
  openGraph: {
    locale: "fa_IR",
    type: "article",
    url: `${process.env.BASE_URL}/mag`
  },
};

export default async  function page() {
  return (
    <MagLayout>
      <Mag />
    </MagLayout>
  );
}
