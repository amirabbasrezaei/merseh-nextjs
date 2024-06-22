import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: ["/add-product", "/profile"],
      },
    ],
    sitemap: `${process.env.BASE_URL}/sitemap.xml`,
  };
}
