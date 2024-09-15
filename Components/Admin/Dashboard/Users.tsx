import { trpc } from "@/utils/trpc";
import React from "react";
import Item from "./Item";

export default function Users() {
  const { data } = trpc.user.users.useQuery();
  return (
    <div>
      {data?.map((user) => (
        <Item
          key={user.id}
          id={user.id}
          section="users"
          title={`${user.name} ${user.familyName}`}
        />
      ))}
    </div>
  );
}
