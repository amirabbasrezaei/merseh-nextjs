"use client";

import { Edit_Svg } from "@/Components/SVGS";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { AdminListRow } from "../../ui/AdminList";
import AdminSelect from "../../ui/AdminSelect";
import AdminBadge, { statusTone } from "../../ui/AdminBadge";

interface Props {
  title: string;
  id: string;
  commentCount?: number;
  selectOptions: { value: string; name: string }[];
  currentStatus: string;
}

export default function Item({
  title,
  id,
  selectOptions,
  currentStatus,
}: Props) {
  const {
    mutate: mutateChangeStatus,
    isPending: isLoading,
    data,
  } = trpc.product.changeCategoryStatus.useMutation();

  const [status, setStatus] = useState(currentStatus);
  useEffect(() => {
    if (data?.currentStatus) {
      setStatus(data.currentStatus);
    }
  }, [data]);

  const statusName =
    selectOptions?.find((item) => item.value === status)?.name || status;

  return (
    <AdminListRow>
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href={`/category/${id}`}
          className="truncate text-base font-medium text-black1 hover:text-green2"
        >
          {title}
        </Link>
        <AdminBadge tone={statusTone(status)}>{statusName}</AdminBadge>
      </div>
      <div className="flex shrink-0 flex-row items-center gap-2">
        <div className="relative">
          {isLoading ? (
            <div className="absolute inset-0 animate-pulse rounded-lg bg-gray-100" />
          ) : null}
          <AdminSelect
            className="!w-auto min-w-[120px] py-1.5"
            value={status}
            onChange={(e) =>
              mutateChangeStatus({
                categoryId: id,
                status: (e.currentTarget.value as "") || "DISABLED",
              })
            }
          >
            {selectOptions?.length
              ? selectOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.name}
                  </option>
                ))
              : null}
          </AdminSelect>
        </div>
        <Link
          href={`/admin/category/${id}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          title="ویرایش"
        >
          <Edit_Svg classname="w-4" />
        </Link>
      </div>
    </AdminListRow>
  );
}
