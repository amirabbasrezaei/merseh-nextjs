import React from "react";
import Item from "../Item";
import { trpc } from "@/utils/trpc";

export default function Orders() {
  const { data } = trpc.order.orders.useQuery();
  return (
    <div>
      {data?.orders?.length
        ? data?.orders?.map((order) => (
            <Item
              key={order.id}
              id={String(order.id)}
              section="users"
              title={`${order.name} ${user.familyName}`}
            />
          ))
        : null}
    </div>
  );
}
