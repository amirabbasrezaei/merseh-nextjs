import React from "react";
import Item from "../Item";
import { trpc } from "@/utils/trpc";
import Order_item from "./Order.item";

export default function Orders() {
  const { data } = trpc.order.orders.useQuery();
  return (
    <div>
      {data?.orders?.length
        ? data?.orders?.map((order) => (
            <Order_item
              key={order.id}
              id={String(order.id)}
              section="users"
              // title={`${order.name} ${user.familyName}`}
            />
          ))
        : null}
    </div>
  );
}
