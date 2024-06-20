import Layout from "@/Components/Layout/Layout";
import Profile from "@/Components/Profile/Profile";
import { Metadata } from "next";
import React from "react";

export function generateMetadata(): Metadata {
  return {
    title: "حساب کاربری",
  };
}

export default function page() {
  return (
    <Layout footer={false}>
      <Profile />
    </Layout>
  );
}
