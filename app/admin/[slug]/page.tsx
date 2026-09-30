import Products from "@/Components/Admin/Dashboard/Products";
import Articles from "@/Components/Admin/Dashboard/Articles";
import Categories from "@/Components/Admin/Dashboard/Categories/Categories";
import Comments from "@/Components/Admin/Dashboard/Comments/Comments";
import Users from "@/Components/Admin/Dashboard/Users";
import Orders from "@/Components/Admin/Dashboard/Orders/Orders";
import Banners from "@/Components/Admin/Dashboard/Banners";
import Brands from "@/Components/Admin/Dashboard/Brands";
import Carousels from "@/Components/Admin/Dashboard/Carousels";
import AccountSettings from "@/Components/Admin/Dashboard/AccountSettings";
import React from "react";

export const revalidate = 60;

const PANES: Record<string, React.ComponentType> = {
  products: Products,
  articles: Articles,
  banners: Banners,
  brands: Brands,
  carousels: Carousels,
  categories: Categories,
  comments: Comments,
  users: Users,
  orders: Orders,
  settings: AccountSettings,
};

export default async function page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const Pane = PANES[slug];

  if (!Pane) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-base text-lightBlack">
        بخشی با این آدرس پیدا نشد.
      </div>
    );
  }

  return <Pane />;
}
