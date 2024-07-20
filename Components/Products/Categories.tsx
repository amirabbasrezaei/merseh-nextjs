import { trpc } from "@/utils/trpc";
import React, { Dispatch, SetStateAction } from "react";
import Category from "./Category";
import { filterTypeArgs } from "./Products";
import GetCategories from "./GetCategories";
interface Props {
  setFilter: Dispatch<SetStateAction<filterTypeArgs>>;
  isAddProductPage?: boolean;
}

export default function Categories({
  setFilter,

}: Props) {
  const { data } = trpc.product.categories.useQuery();

  return (
    <div>
      <span className="text-black1 text-[18px] mb-4">دسته‌بندی‌ ها</span>
      {data?.length &&
        data.map((cat, index) => (
          <Category
            setFilter={setFilter}
            catId={cat.id}
            key={cat.id}
            name={cat.title}
            subCategory={cat.subCategories}

          />
        ))}
    </div>
  );
}
