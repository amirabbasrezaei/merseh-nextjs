import MagLayout from "@/Components/Layout/MagLayout";
import Articles from "@/Components/Mag/Articles/Articles";
import { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: "مجله مرسه" },
  description:
    " مجله مرسه کاربردی ترین و جدیدترین موضوعات مربوط به حوزه سلامتی، محصولات طبیعی و ارگانیک را منتشر می‌کند",
  alternates: {
    canonical: `${process.env.BASE_URL}/mag/articles`,
  },
  metadataBase: new URL(`${process.env.BASE_URL}/mag/articles`),
  robots: { follow: true, index: true },
  openGraph: {
    locale: "fa_IR",
    type: "article",
    url: `${process.env.BASE_URL}/mag`
  },
};
export default function page() {
  return (
    <MagLayout>
      <Articles />
    </MagLayout>
  );
}
