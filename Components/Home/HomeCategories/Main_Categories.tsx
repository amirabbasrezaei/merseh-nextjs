"use client";

import { trpc } from "@/utils/trpc";
import CategoryItem, { categoryTileWidthClass } from "./CategoryItem.mainCategory";
import SectionHeader from "../ui/SectionHeader";
import { SITE_NAME } from "@/utils/site";

const rowClass =
  "no-scrollbar -mx-[5vw] flex snap-x snap-mandatory gap-4 overflow-x-auto px-[5vw] scroll-px-[5vw] sm:-mx-6 sm:gap-5 sm:px-6 sm:scroll-px-6 lg:mx-0 lg:grid lg:grid-cols-6 lg:gap-6 lg:overflow-visible lg:px-0";

export default function Main_Categories() {
  const { data, isLoading } = trpc.product.categories.useQuery();
  const categories = data?.[0]?.subCategories ?? [];
  const showCategories = !isLoading && categories.length > 0;

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <SectionHeader
        id="home-categories"
        eyebrow="خرید بر اساس دسته‌بندی"
        title={`دنیای زیبایی ${SITE_NAME}`}
        href="/mcategory"
        linkLabel="همه دسته‌بندی‌ها"
      />
      {showCategories ? (
        <div className={rowClass}>
          {categories.map((category) => (
            <CategoryItem
              key={category.id}
              id={category.id}
              image_url={category.imageUrl}
              title={category.title}
            />
          ))}
        </div>
      ) : (
        <div className={rowClass} aria-hidden>
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className={`flex flex-col items-center gap-4 ${categoryTileWidthClass}`}
            >
              <div className="arch aspect-[3/4] w-full animate-pulse bg-blush-100" />
              <div className="h-4 w-2/3 animate-pulse rounded-full bg-blush-100" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
