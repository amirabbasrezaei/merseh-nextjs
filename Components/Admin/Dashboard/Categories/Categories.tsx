import { trpc } from "@/utils/trpc";
import { motion } from "framer-motion";
import Item from "./Item.categories";
import { useEffect } from "react";

export default function Categories() {
  const { data, isLoading } = trpc.product.flatCategories.useQuery();

  useEffect(() => {
    console.log(data);
  }, [data]);
  return (
    <motion.div>
      {isLoading ? (
        <div></div>
      ) : (
        <div className="flex flex-col gap-5">
          {data?.categories?.length
            ? data.categories.map((category) => (
                <Item
                  key={category.id}
                  title={category.title}
                  id={String(category.id)}
                  currentStatus={category.status}
                  selectOptions={data.statusOptions}
                />
              ))
            : null}
        </div>
      )}
    </motion.div>
  );
}
