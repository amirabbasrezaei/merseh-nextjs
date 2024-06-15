import Layout from "@/Components/Layout/Layout";
import Profile from "@/Components/Profile/Profile";
import React from "react";

export default function page() {
  return (
    <Layout footer={false}>
      <Profile />
    </Layout>
  );
}
