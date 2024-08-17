import React from "react";
import { motion } from "framer-motion";
import { trpc } from "@/utils/trpc";
import Item from "./Item";

export default function Products() {
  const { data, isLoading } = trpc.product.shortInfoProducts.useQuery();
  return (
    <motion.div>
      {isLoading ? (
        <div></div>
      ) : (
        <div className="flex flex-col gap-5">
          {data?.products?.length
            ? data.products.map((product) => (
                <Item
                  key={product.id}
                  title={product.name}
                  id={String(product.id)}
                  section="product"
                  commentCount={product.Comments.length}
                />
              ))
            : null}
        </div>
      )}
    </motion.div>
  );
}
