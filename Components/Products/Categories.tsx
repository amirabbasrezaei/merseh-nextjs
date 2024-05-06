import { trpc } from "@/utils/trpc";
import React from "react";
import Category from "./Category";
interface Props {
  name: string;
}
export interface categoryType {
  id: string;
  title: string;
  parentCategoryId: string | null;
  subCategories?: any[] | undefined;
  insertedIntoParent?: boolean | undefined;
}
[];
export default function Categories() {
  const { data } = trpc.product.categories.useQuery();
  
  return (
    <div>
      <h4 className="text-black1 text-[18px] mb-4">دسته‌بندی‌ ها</h4>
      {data?.length &&
        data.map((cat) => (
          <Category name={cat.title} subCategory={cat.subCategories} />
        ))}
    </div>
  );
}
