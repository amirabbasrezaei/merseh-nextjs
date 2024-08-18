import { trpc } from "@/utils/trpc";
import React, { Dispatch, SetStateAction } from "react";

import { filterTypeArgs } from "./Products";
import dynamic from "next/dynamic";
interface Props {
  setFilter: Dispatch<SetStateAction<filterTypeArgs>>;
  isAddProductPage?: boolean;
  filter: filterTypeArgs;
}

const GetCategories = dynamic(() => import("./GetCategories"), { ssr: true });

export default function Categories({ setFilter, filter }: Props) {
  const { data } = trpc.product.categories.useQuery(undefined, {
    cacheTime: 60,
  });

  return (
    <div className="w-full">
      <span className="text-black1 text-[18px]">دسته‌بندی‌ ها</span>
      <div className="mt-4 ">
        {data?.length ? (
          data.map((cat, index) => (
            <GetCategories
              setFilter={setFilter}
              catId={[cat.id]}
              key={cat.id}
              data={cat.subCategories || []}
              filter={filter}
            />
          ))
        ) : (
          <div className="flex flex-col gap-5 w-full items-center justify-center">
            {Array.from(Array(10)).map((_, i) => (
              <div key={i} className="w-full flex flex-row gap-1">
                <div className="w-6 h-6 bg-gray-100 rounded-md animate-pulse" />
                <div className="w-28 h-6 bg-gray-100 rounded-md animate-pulse" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
