"use client";

import { trpc } from "@/utils/trpc";
import React from "react";
import Item from "./Item";
import { AdminList } from "../ui/AdminList";
import AdminLoading from "../ui/AdminLoading";
import AdminEmpty from "../ui/AdminEmpty";

export default function Users() {
  const { data, isLoading } = trpc.user.users.useQuery();

  return (
    <div className="flex flex-col">
      {isLoading ? (
        <AdminLoading />
      ) : data?.length ? (
        <AdminList>
          {data.map((user) => (
            <Item
              key={user.id}
              id={user.id}
              section="users"
              title={`${user.name} ${user?.familyName || ""}`}
            />
          ))}
        </AdminList>
      ) : (
        <AdminEmpty title="کاربری یافت نشد" />
      )}
    </div>
  );
}
