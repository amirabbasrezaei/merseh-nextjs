"use client";

import React from "react";
import { trpc } from "@/utils/trpc";
import Order_item from "./Order.item";
import { AdminList } from "../../ui/AdminList";
import AdminLoading from "../../ui/AdminLoading";
import AdminEmpty from "../../ui/AdminEmpty";

export default function Orders() {
  const { data, isLoading } = trpc.order.orders.useQuery();

  return (
    <div className="flex flex-col">
      {isLoading ? (
        <AdminLoading />
      ) : data?.orders?.length ? (
        <AdminList>
          {data.orders.map((order) => (
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
          ))}
        </AdminList>
      ) : (
        <AdminEmpty title="سفارشی یافت نشد" />
      )}
    </div>
  );
}
