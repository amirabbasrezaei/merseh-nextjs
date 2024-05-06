"use client";
import { trpc } from "@/utils/trpc";

import React from "react";
import ProductCard from "../Product/ProductCard";
import { Magnifier } from "../Home/SVGS";
import Categories from "./Categories";


export default function Products() {
  const { data } = trpc.product.getproducts.useQuery();
  console.log(data);
  return (
    <section className="flex flex-row w-full px-10">
      <div className="basis-3/12 flex flex-col gap-10">
        <div className="  h-[40px] px-5 items-center justify-right w-[80%] flex flex-row bg-[#F6F6F6]  rounded-[10px]">
          <Magnifier classname="w-[18px] " />
          <input
            placeholder="جستجو در میان محصولات زیر"
            className="bg-transparent  h-full placeholder:text-[13px] w-full text-black1 placeholder:text-[#8b8b8b]  pr-2  appearance-none outline-none"
          />
        </div>
        <div>
        <Categories />
        </div>
      </div>
      <div className="basis-9/12 flex flex-col gap-4 items-center justify-center">
        <div className="md:grid grid-cols-4 flex-row gap-4">
          {data?.length &&
            // @ts-ignore
            data.map((pr, index) => (
              <ProductCard
                imageUrl={pr.imageUrl}
                price={pr.price}
                title={pr.name}
                pathname={`product/${String(pr.id)}`}
              />
            ))}
          {data?.length &&
            // @ts-ignore
            data.map((pr, index) => (
              <ProductCard
                imageUrl={pr.imageUrl}
                price={pr.price}
                title={pr.name}
                pathname={`product/${String(pr.id)}`}
              />
            ))}
          {data?.length &&
            // @ts-ignore
            data.map((pr, index) => (
              <ProductCard
                imageUrl={pr.imageUrl}
                price={pr.price}
                title={pr.name}
                pathname={`product/${String(pr.id)}`}
              />
            ))}
          {data?.length &&
            // @ts-ignore
            data.map((pr, index) => (
              <ProductCard
                imageUrl={pr.imageUrl}
                price={pr.price}
                title={pr.name}
                pathname={`product/${String(pr.id)}`}
              />
            ))}
        </div>
      </div>
    </section>
  );
}
