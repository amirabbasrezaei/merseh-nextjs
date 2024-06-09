import { trpc } from "@/utils/trpc";
import React, { Dispatch, SetStateAction } from "react";
import Category from "./Category.add_product";
import { filterTypeArgs } from "./AddProduct";
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
      <h4 className="text-black1 text-[18px] mb-4">دسته‌بندی‌ ها</h4>
      {data?.length &&
        data.map((cat) => (
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
