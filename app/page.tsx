import Home from "@/Components/Home/Home";
import Layout from "@/Components/Layout/Layout";

export const revalidate = 3600;

export default function page() {
  return (
    <Layout>
      <Home />
    </Layout>
  );
}
