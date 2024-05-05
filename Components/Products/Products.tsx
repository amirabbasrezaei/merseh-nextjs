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
    <section className="flex flex-row w-full">
      <div className="basis-4/12"></div>
      <div className="basis-8/12 flex flex-col gap-4">
        <div className="flex flex-row gap-4">
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
        <div className="flex flex-row gap-4">
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
        <div className="flex flex-row gap-4">
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
        <div className="flex flex-row gap-4">
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
        <div className="flex flex-row gap-4">
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
