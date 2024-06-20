import Layout from "@/Components/Layout/Layout";
import Product from "@/Components/Product/Product";
import { trpc } from "@/utils/trpc";
import axios from "axios";
import { Metadata, NextPage } from "next";
export type NextPagePropsType = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({
  params,
}: NextPagePropsType): Promise<Metadata> {
  const { data } = await axios.get(
    `http://localhost:3000/api/trpc/product.getproduct?input={"productId":2}`
  );
  console.log(data.result.data.product.content);

  if (data?.result?.data?.product) {
    return {
      title: data.result.data.product.name,
      description:
        data.result.data.product.content
          .filter((e: any) => e.type === "text")[0]
          ?.content.toString() || "",
      openGraph: {
        images: data.result.data.product.imageUrls.map((e: any) => ({
          url: e,
        })),
      },
    };
  }
  return {};
}

export default function Page({ params }: NextPagePropsType) {
  return (
    <Layout>
      <Product productId={params.slug} />
    </Layout>
  );
}

// export async function getStaticProps(context: GetStaticPropsContext) {
//   console.log(context)
//   // const {} = trpc.product.getproduct.useQuery({productId: Router})
//   return {
//     props: { message: `Next.js is awesome` },
//     // will be passed to the page component as props
//   }
// }
