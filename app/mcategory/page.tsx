import Layout from "@/Components/Layout/Layout";
import MobileCategory from "@/Components/Navbar/MobileCategory";
import { Metadata } from "next";
import React from "react";

export function generateMetadata():Metadata{
  return{
    title:"دسته بندی ها"
  }
}

export default function page() {
  return (
    <Layout footer={false} header={false} fullWidth={true}>
      <MobileCategory />
    </Layout>
  );
}
