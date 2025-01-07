import React from "react";
import { trpc } from "@/utils/trpc";
import Order_item from "./Order.item";

export default function Orders() {
  const { data } = trpc.order.orders.useQuery();
  return (
    <div>
      {data?.orders?.length
        ? data?.orders?.map((order) => (
            <Order_item
              customer_name={order.user.name}
              province={order?.Address?.Province?.name || ""}
              key={order.id}
              id={String(order.id)}
              section="users"
              phoneNumber={
                order.Address.reciverPhoneNumber || order.user.phoneNumber
              }
              city={order?.Address?.city?.name || ""}

            />
          ))
        : null}
    </div>
  );
}
