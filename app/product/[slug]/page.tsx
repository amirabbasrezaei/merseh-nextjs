import Layout from "@/Components/Layout/Layout";
import Product from "@/Components/Product/Product";
import { trpc } from "@/utils/trpc";
import { NextPage } from "next";
export type NextPagePropsType = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

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
