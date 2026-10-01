import Layout from "@/Components/Layout/Layout";
import MobileCategory from "@/Components/Navbar/MobileCategory";
import { Metadata } from "next";
import { SITE_NAME } from "@/utils/site";

export function generateMetadata(): Metadata {
  return {
    title: { absolute: "دسته بندی کالاها" },
    description:
      `دسته‌بندی کالاهای فروشگاه آنلاین ${SITE_NAME}؛ محصولات آرایشی، بهداشتی و مراقبت پوست و مو را بر اساس دسته پیدا کنید.`,
    alternates: {
      canonical: `${process.env.BASE_URL}/mcategory`,
    },
  };
}

export default function page() {
  return (
    <Layout footer={false} fullWidth>
      <MobileCategory />
    </Layout>
  );
}
