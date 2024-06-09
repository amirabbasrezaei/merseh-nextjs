import Layout from "@/Components/Layout/Layout";
import MobileCategory from "@/Components/Navbar/MobileCategory";
import React from "react";

export default function page() {
  return (
    <Layout footer={false} header={false} fullWidth={true}>
      <MobileCategory />
    </Layout>
  );
}
