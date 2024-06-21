import React from "react";
import Layout_Empty from "@/Components/Layout/Layout_Empty";
import Auth from "@/Components/Auth/Auth";
import { Metadata } from "next";

export function generateMetadata(): Metadata {
  return {
    title: "ورود | ثبت نام",
    alternates: {
      canonical: `${process.env.BASE_URL}/auth`,
    },
  };
}

export default function page() {
  return (
    <Layout_Empty>
      <Auth />
    </Layout_Empty>
  );
}
