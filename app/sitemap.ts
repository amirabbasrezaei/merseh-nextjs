import { trpc } from "@/utils/trpc";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const {  mutateAsync } = trpc.product.products.useMutation();
  const links: MetadataRoute.Sitemap = [
    {
      url: "https://merseh.com",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
  ];

  const { products } = await mutateAsync();


    products.map((product) => {
      links.push({
        url: `${process.env.BASE_URL || ""}/product/${product.id}`,
        lastModified: new Date(product.updatedAt),
        changeFrequency: "weekly",
        priority: 0.5,
      });
    });
  

  return links;
}
