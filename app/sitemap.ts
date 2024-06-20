import axios from "axios";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const links: MetadataRoute.Sitemap = [
    {
      url: "https://merseh.com",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: "https://merseh.com/products",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/trpc/product.products`
    );
    if (data.result.data?.products?.length) {
      data.result.data.products.map((product: any) => {
        links.push({
          url: `${process.env.NEXT_PUBLIC_BASE_URL || ""}/product/${
            product.id
          }`,
          lastModified: new Date(product.updatedAt),
          changeFrequency: "weekly",
          priority: 0.6,
        });
      });
    }
    return links;
  } catch (error) {
    return links;
  }
}
