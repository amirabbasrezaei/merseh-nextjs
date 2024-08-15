
import AdminDashboard from "@/Components/Admin/Dashboard/AdminDashboard";
import Layout from "@/Components/Layout/Layout";
import React from "react";

export default function page() {
  return (
    <Layout footer={false} header={false}>
      <AdminDashboard />
    </Layout>
  );
}
