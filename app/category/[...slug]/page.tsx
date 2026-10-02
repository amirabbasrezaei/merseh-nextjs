import Layout from "@/Components/Layout/Layout";
import Products, { ProductsFallback } from "@/Components/Products/Products";
import { categoryInfoController } from "@/server/Controllers/category.controller";
import { pageContext } from "@/server/pageContext";

import { Metadata } from "next";
import { Suspense, cache } from "react";

export type NextPagePropsType = {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const revalidate = 3600;

const getCategory = cache(async (categoryId: string) => {
  const id = Number(categoryId);
  if (!Number.isFinite(id)) return null;

  try {
    return await categoryInfoController({
      input: { categoryId: id },
      ctx: pageContext(),
    });
  } catch {
    return null;
  }
});

// export const metadata: Metadata = {
//   title: "محصولات",
//   alternates: {
//     canonical: `${process.env.BASE_URL}/category`,
//   },
// };



export async function generateMetadata({
  params,
}: NextPagePropsType): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug[0]);
  if (category?.category) {
    return {
      title: { absolute: `قیمت ${category.category.title}` },
      alternates: {
        canonical: `${process.env.BASE_URL}/category/${slug[0]}/${(
          category.category.title as string
        )?.replaceAll(" ", "-")}`,
      },
      description: category.category.metaDescription,
      openGraph: {
        images: category.category.imageUrl,
        type: "article",
        url: `${process.env.BASE_URL}/category/${slug[0]}/${(
          category.category.title as string
        )?.replaceAll(" ", "-")}`,
      },
    };
  }
  return {};
}

export default async function page({ params }: NextPagePropsType) {
  const { slug } = await params;
  const category = await getCategory(slug[0]);
  return (
    <Layout>
      <Suspense fallback={<ProductsFallback category={category?.category} />}>
        <Products
          key={slug[0]}
          category={category?.category}
          categoryId={Number(slug[0])}
        />
      </Suspense>
    </Layout>
  );
}

