
import AdminDashboard from "@/Components/Admin/Dashboard/AdminDashboard";
import Layout from "@/Components/Layout/Layout";
import React from "react";
export const revalidate = 60;
export default function page({params}:any) {
  return (
    <Layout footer={false} header={false}>
      <AdminDashboard route={params.slug}/>
    </Layout>
  );
}
