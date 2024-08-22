import { Comment_SVG, Edit_Svg } from "@/Components/SVGS";
import { trpc } from "@/utils/trpc";
import Link from "next/link";

import React, { useEffect, useState } from "react";
interface Props {
  user_name: string;
  user_lastName: string;
  section: string;
  sectionName: string;
  id: string;
  selectOptions: object[];
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

  return (
    <div className="border flex flex-row w-full p-5 rounded-md justify-between">
      <div className="flex flex-row gap-1">
        <span>{user_name}</span>
        <span>{user_lastName}</span>
      </div>

      <Link
        href={`/${section}/${id}/${sectionName.replaceAll(" ", "-")}`}
        className="flex flex-row gap-1"
      >
        <span className="font-[500]">
          {section === "product"
            ? "محصول"
            : section === "article"
            ? "مقاله"
            : null}
        </span>
        <span>:</span>
        <span>{sectionName}</span>
      </Link>

      <div className="flex flex-row gap-10 items-center">
        <select
          onChange={(e) =>
            mutateChangeStatus({
              commentId: id,
              status: (e.currentTarget.value as "") || "NEED_REVIEW",
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
        <div className="bg-gray-100 rounded-full w-7 h-7 flex items-center justify-center">
          <Edit_Svg classname="w-5" />
        </div>
      </div>
    </div>
  );
}
