import { Comment_SVG, Edit_Svg } from "@/Components/SVGS";
import { trpc } from "@/utils/trpc";

import Link from "next/link";
import React, { useEffect, useState } from "react";
interface Props {
  title: string;
  id: string;
  commentCount?: number;
  selectOptions: object[];
  currentStatus: string;
}

export default function Item({
  title,
  id,
  commentCount,
  selectOptions,
  currentStatus,
}: Props) {
  const {
    mutate: mutateChangeStatus,
    isLoading,
    data,
  } = trpc.product.changeCategoryStatus.useMutation();

  const [status, setStatus] = useState(currentStatus);
  useEffect(() => {
    if (data?.currentStatus) {
      setStatus(data.currentStatus);
    }
  }, [data]);

  return (
    <div className="border flex flex-row w-full p-5 rounded-md justify-between">
      <Link href={`/category/${id}`}>
        <span>{title}</span>
      </Link>
      <div className="flex flex-row gap-10 items-center">
        {commentCount ? (
          <div className="flex flex-row gap-1">
            <span>{commentCount}</span>
            <Comment_SVG classname="w-6 h-6 fill-black" />
          </div>
        ) : null}
        <div className="relative">
          {isLoading ? (
            <div className="absolute top-0 w-full h-full bg-gray-100 animate-pulse" />
          ) : null}
          <select
            onChange={(e) =>
              mutateChangeStatus({
                categoryId: id,
                status: (e.currentTarget.value as "") || "DISABLED",
              })
            }
            className="block   w-full bg-white border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          >
            {selectOptions?.length
              ? selectOptions.map((item: any) => (
                  <option
                    selected={item.value === status}
                    key={item.value}
                    value={item.value}
                    className=""
                  >
                    {item.name}
                  </option>
                ))
              : null}
          </select>
        </div>
        <Link
          href={`/admin/category/${id}`}
          className="bg-gray-100 rounded-full w-7 h-7 flex items-center justify-center"
        >
          <Edit_Svg classname="w-5" />
        </Link>
      </div>
    </div>
  );
}
