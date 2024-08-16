import ManageCategory from "@/Components/Admin/Category/ManageCategory";
import Layout from "@/Components/Layout/Layout";
import React from "react";

export default function page({params}:any) {
  return (
    <Layout footer={false} header={false}>
      <ManageCategory categoryId={params.slug} />
    </Layout>
  );
}
