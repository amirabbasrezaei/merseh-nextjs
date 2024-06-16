import { trpc } from "@/utils/trpc";

import React from "react";
import OrderItem from "./OrderItem";
import { LayoutGroup, motion } from "framer-motion";
export default function Orders() {
  const { data, isLoading } = trpc.order.orders.useQuery();

 

  return (
    <motion.div layout className=" w-full flex flex-col gap-4">
      <LayoutGroup id="orders">
        {isLoading ? (
          <div></div>
        ) : data?.orders.length ? (
          data.orders.map((order) => (
            <OrderItem
              orderId={order.id}
              orderProducts={order.ProductForOrder}

              orderStatus={order.status}
              key={order.id}
              address={{
                city: order?.Address?.city?.name || "",
                postalCode: order.Address?.postalCode || undefined,
                province: order?.Address?.Province?.name || "",
                recieverFamilyName: order.Address?.reciverFamilyName || "",
                recieverName: order.Address?.reciverName || "",
                title: order?.Address.title,
              }}
            />
          ))
        ) : null}
      </LayoutGroup>
    </motion.div>
  );
}
