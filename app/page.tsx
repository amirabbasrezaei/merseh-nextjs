import Home from "@/Components/Home/Home";
import Layout from "@/Components/Layout/Layout";
import { MersehSvg } from "@/Components/SVGS";

export default function page() {
  return (
    <>
      {process.env.NODE_ENV === "production" ? (
        <div className="w-screen h-screen flex items-center justify-center flex-col gap-10">
          <MersehSvg classname="w-20 h-auto" />
          <span className="font-[600] text-[20px] text-[#646464]">
            منتظرمون باشین :)
          </span>
        </div>
      ) : (
        <Layout>
          <Home />
        </Layout>
      )}
    </>
  );
}
