import AddProduct from "@/Components/Admin/AddProduct/AddProduct";
import Layout_Empty from "@/Components/Layout/Layout_Empty";
import React from "react";

export default function page() {
  return (
    <Layout_Empty>
      <AddProduct />
    </Layout_Empty>
  );
}
