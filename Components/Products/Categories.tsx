import { trpc } from "@/utils/trpc";
import React, { Dispatch, SetStateAction } from "react";

import { filterTypeArgs } from "./Products";
import GetCategories from "./GetCategories";
interface Props {
  setFilter: Dispatch<SetStateAction<filterTypeArgs>>;
  isAddProductPage?: boolean;
  filter: filterTypeArgs;
}

export default function Categories({ setFilter, filter }: Props) {
  const { data } = trpc.product.categories.useQuery();

  return (
    <div>
      <span className="text-black1 text-[18px]">دسته‌بندی‌ ها</span>
      <div className="mt-4">
        {data?.length &&
          data.map((cat, index) => (
            <GetCategories
              setFilter={setFilter}
              catId={[cat.id]}
              key={cat.id}
              data={cat.subCategories || []}
              filter={filter}
            />
          ))}
      </div>
    </div>
  );
}
