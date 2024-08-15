import React from "react";
import { motion } from "framer-motion";
import { trpc } from "@/utils/trpc";

export default function Products() {
  const { data, isLoading } = trpc.product.shortInfoProducts.useQuery();
  return (
    <motion.div>
      {isLoading ? (
        <div></div>
      ) : (
        <div>
          {data?.products?.length ? data.products.map((product) => <div>
            <span>{product.name}</span>
          </div>) : null}
        </div>
      )}
    </motion.div>
  );
}
