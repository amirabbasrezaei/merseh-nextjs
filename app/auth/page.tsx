import React from "react";
import Layout_Empty from "@/Components/Layout/Layout_Empty";
import Auth from "@/Components/Auth/Auth";

export default function page() {
  return (
    <Layout_Empty>
      <Auth />
    </Layout_Empty>
  );
}
