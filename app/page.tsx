import Home from "@/Components/Home/Home";
import Layout from "@/Components/Layout/Layout";
import { MersehSvg } from "@/Components/SVGS";
export const revalidate = 120;
export default function page() {
  return (
    <>

        <Layout>
          <Home />
        </Layout>

    </>
  );
}
