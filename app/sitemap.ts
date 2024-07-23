import axios from "axios";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const links: MetadataRoute.Sitemap = [
    {
      url: "https://merseh.com",
      lastModified: new Date(Date.now()),
      changeFrequency: "hourly",
      priority: 1,
    }
    //,
//    {
//      url: "https://merseh.com/category",
//      lastModified: new Date(Date.now()),
//      changeFrequency: "hourly",
//      priority: 0.8,
 //   },
  ];

  try {
    const { data } = await axios.get(
      `${process.env.BASE_URL}/api/trpc/product.products`
    );
    const {categoryData} = await axios.get(`${process.env.BASE_URL}/api/trpc/product.flatCategories`)
    
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

      if((categoryData.result.data?.length){
        const categories = categoryData.result.data.map((category: any) => ({
        url: `${
          process.env.NODE_ENV === "production"
            ? process.env.BASE_URL
            : "http://localhost:3000"
        }/category/${category.id}/${(category.title as string).replaceAll(
          " ",
          "-"
        )}`,
        lastModified: new Date(Date.now()),
        changeFrequency: "daily",
        priority: 0.9,
      }));
        return [...links, ...products, ...categories];
      }

      
      return [...links, ...products];
    }
    return links;
  } catch (error) {
    console.log(error);
    return links;
  }
}
