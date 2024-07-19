import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: ["/add-product", "/profile", "/_next" ],
      },
    ],
    sitemap: `${process.env.BASE_URL}/sitemap.xml`,
  };
}
