import { trpc } from "@/utils/trpc";
import React from "react";
import { motion } from "framer-motion";
import Item from "./Item";

export default function Categories() {
  const { data, isLoading } = trpc.product.flatCategories.useQuery();
  return (
    <motion.div>
      {isLoading ? (
        <div></div>
      ) : (
        <div className="flex flex-col gap-5">
          {data?.length
            ? data.map((category) => (
                <Item
                  title={category.title}
                  id={String(category.id)}
                  section="category"
                />
              ))
            : null}
        </div>
      )}
    </motion.div>
  );
}
