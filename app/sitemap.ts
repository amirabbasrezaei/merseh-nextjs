import axios from "axios";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const links: MetadataRoute.Sitemap = [
    {
      url: "https://merseh.com",
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://merseh.com/mag",
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://merseh.com/mag/articles",
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  try {
    const { data } = await axios.get(
      `${process.env.BASE_URL}/api/trpc/product.shortInfoProducts`
    );
    const { data: categoryData } = await axios.get(
      `${process.env.BASE_URL}/api/trpc/product.flatCategories`
    );
    const { data: articleData } = await axios.get(
      `${process.env.BASE_URL}/api/trpc/article.sitemapArticle`
    );

    if (data.result.data?.products?.length) {
      const products = data.result.data.products.map((product: any) => ({
        url: `${
          process.env.NODE_ENV === "production"
            ? process.env.BASE_URL
            : "http://localhost:3000"
        }/product/${product.id}/${(product.name as string).replaceAll(
          " ",
          "-"
        )}`,
        lastModified: new Date(product.updatedAt),
        changeFrequency: "daily",
        priority: 0.9,
      }));

      links.push(...products);
    }

    if (categoryData.result.data?.categories?.length) {
      const categories = categoryData.result.data.categories.map(
        (category: any) => ({
          url: `${
            process.env.NODE_ENV === "production"
              ? process.env.BASE_URL
              : "http://localhost:3000"
          }/category/${category.id}/${(category.title as string).replaceAll(
            " ",
            "-"
          )}`,
          lastModified: new Date(category.updated_at || Date.now()),
          changeFrequency: "daily",
          priority: 0.9,
        })
      );
      links.push(...categories);
    }

    if (articleData.result.data?.articles?.length) {
      const articles = articleData.result.data.articles.map((article: any) => ({
        url: `${
          process.env.NODE_ENV === "production"
            ? process.env.BASE_URL
            : "http://localhost:3000"
        }/mag/${article.id}/${(
          article.englishTitle || article.title
        ).replaceAll(" ", "-")}`,
        lastModified: new Date(article.updated_at || Date.now()),
        changeFrequency: "daily",
        priority: 0.9,
      }));
      links.push(...articles);
    }

    return links;
  } catch (error) {
    console.log(error);
    return links;
  }
}
