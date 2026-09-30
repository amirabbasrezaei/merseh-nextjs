"use client";

import { trpc } from "@/utils/trpc";
import CategoryItem from "./CategoryItem.mainCategory";
import SectionHeader from "../ui/SectionHeader";

export default function Main_Categories() {
  const { data, isLoading } = trpc.product.categories.useQuery();
  const categories = data?.[0]?.subCategories ?? [];
  const showCategories = !isLoading && categories.length > 0;

  return (
    <div className="flex w-full flex-col gap-4">
      <SectionHeader
        id="home-categories"
        title="دسته‌بندی"
        href="/mcategory"
        linkLabel="سایر دسته‌بندی‌ها"
      />
      {showCategories ? (
        <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto">
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
        <div className="no-scrollbar flex gap-4 overflow-hidden" aria-hidden>
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="aspect-square w-[120px] shrink-0 animate-pulse rounded-tile bg-hover1 md:w-[160px]"
            />
          ))}
        </div>
      )}
    </div>
  );
}
