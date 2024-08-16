import Layout from "@/Components/Layout/Layout";
import MobileCategory from "@/Components/Navbar/MobileCategory";
import { Metadata } from "next";
import React from "react";

export function generateMetadata(): Metadata {
  return {
    title: { absolute: "دسته بندی کالاها" },
    description:
      "دسته بندی انواع کالاهای فروشگاه مرسه مانند روغن زیتون، روغن کنجد، روغن آرگان، روغن آفتابگردان و ...",
    alternates: {
      canonical: `${process.env.BASE_URL}/mcategory`,
    },
  };
}

export default function page() {
  return (
    <Layout footer={false} header={false} fullWidth={true}>
      <MobileCategory />
    </Layout>
  );
}
