import { trpc } from "@/utils/trpc";
import React, { Dispatch, SetStateAction } from "react";
import Category from "./Category";
import { filterTypeArgs } from "./Products";
interface Props {
  setFilter: Dispatch<SetStateAction<filterTypeArgs>>;
  isAddProductPage?: boolean
}

export default function Categories({ setFilter, isAddProductPage=false }: Props) {
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
            isAddProductPage={isAddProductPage}
          />
        ))}
    </div>
  );
}
