"use client";

import { trpc } from "@/utils/trpc";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { AdminListRow } from "../../ui/AdminList";
import AdminSelect from "../../ui/AdminSelect";
import AdminBadge, { statusTone } from "../../ui/AdminBadge";

interface Props {
  user_name: string;
  user_lastName: string;
  section: string;
  sectionName: string;
  id: string;
  selectOptions: { value: string; name: string }[];
  currentStatus: string;
}

export default function CommentItem({
  user_name,
  user_lastName,
  id,
  section,
  sectionName,
  currentStatus,
  selectOptions,
}: Props) {
  const { mutate: mutateChangeStatus, data } =
    trpc.comment.changeCommentStatus.useMutation();

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
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-base font-medium text-black1">
          {user_name} {user_lastName}
        </span>
        <Link
          href={`/${section}/${id}/${sectionName.replaceAll(" ", "-")}`}
          className="text-sm text-lightBlack hover:text-green2"
        >
          {section === "product"
            ? "محصول"
            : section === "article"
              ? "مقاله"
              : null}
          {sectionName ? `: ${sectionName}` : null}
        </Link>
        <AdminBadge tone={statusTone(status)} className="w-fit">
          {statusName}
        </AdminBadge>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <AdminSelect
          className="!w-auto min-w-[140px] py-1.5"
          value={status}
          onChange={(e) =>
            mutateChangeStatus({
              commentId: id,
              status: (e.currentTarget.value as "") || "NEED_REVIEW",
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
    </AdminListRow>
  );
}
