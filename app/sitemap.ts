import type { MetadataRoute } from "next";
import { prisma } from "@/server/context";

// Cached by default, and the image build has no database and cannot reach
// the public site. A prerender here hangs until the static-generation timeout.
export const dynamic = "force-dynamic";

function siteOrigin(): string {
  return (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
}

function pathSegment(value: string): string {
  return value.replaceAll(" ", "-");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteOrigin();
  const links: MetadataRoute.Sitemap = [
    {
      url: origin,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${origin}/mag`,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${origin}/mag/articles`,
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  try {
    const [products, categories, articles] = await Promise.all([
      prisma.product.findMany({
        where: { status: "PUBLISHED" },
        select: { id: true, name: true, updatedAt: true },
      }),
      prisma.category.findMany({
        where: { status: "ENABLED" },
        select: { id: true, title: true, updated_at: true },
      }),
      prisma.article.findMany({
        where: { status: "PUBLISHED" },
        select: {
          id: true,
          title: true,
          englishTitle: true,
          updated_at: true,
        },
      }),
    ]);

    links.push(
      ...products.map(
        (product): MetadataRoute.Sitemap[number] => ({
          url: `${origin}/product/${product.id}/${pathSegment(product.name)}`,
          lastModified: product.updatedAt,
          changeFrequency: "daily",
          priority: 0.9,
        })
      ),
      ...categories.map(
        (category): MetadataRoute.Sitemap[number] => ({
          url: `${origin}/category/${category.id}/${pathSegment(category.title)}`,
          lastModified: category.updated_at ?? new Date(),
          changeFrequency: "daily",
          priority: 0.9,
        })
      ),
      ...articles.map(
        (article): MetadataRoute.Sitemap[number] => ({
          url: `${origin}/mag/${article.id}/${pathSegment(
            article.englishTitle || article.title
          )}`,
          lastModified: article.updated_at ?? new Date(),
          changeFrequency: "daily",
          priority: 0.9,
        })
      )
    );
  } catch (error) {
    console.error("sitemap: failed to load catalog", error);
  }

  return links;
}
