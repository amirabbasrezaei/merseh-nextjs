"use client";
import { trpc } from "@/utils/trpc";
import { useSearchParams } from "next/navigation";
import React from "react";
import ProductCard from "../Product/ProductCard";

export default function Products() {
  const { data } = trpc.product.getproducts.useQuery();
  const params = useSearchParams();
  console.log(data);
  return (
    <section className="flex flex-row w-full px-10">
      <div className="basis-4/12"></div>
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
