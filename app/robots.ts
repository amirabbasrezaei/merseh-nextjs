import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: ["/admin/*", "/profile", "/_next", "/cart/*", "/admin" ],
      },
    ],
    sitemap: `${process.env.BASE_URL}/sitemap.xml`,
  };
}
