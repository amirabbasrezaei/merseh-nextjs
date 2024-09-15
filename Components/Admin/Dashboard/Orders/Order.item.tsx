import { Comment_SVG, Edit_Svg } from "@/Components/SVGS";
import Link from "next/link";
import React from "react";
interface Props {

  id: string;
  section: string;
  commentCount?: number;
}

export default function Order_item({

  id,
  section,
  commentCount,
}: Props) {
  return (
    <div className="border flex flex-row w-full p-5 rounded-md justify-between">
      <Link href={`/${section === "article" ? "mag" : section}/${id}`}>
        {/* <span>{title}</span> */}
      </Link>
      <div className="flex flex-row gap-10 items-center">
        {commentCount ? (
          <div className="flex flex-row gap-1">
            <span>{commentCount}</span>
            <Comment_SVG classname="w-6 h-6 fill-black" />
          </div>
        ) : null}

        <Link
          href={`/admin/${section}/${id}`}
          className="bg-gray-100 rounded-full w-7 h-7 flex items-center justify-center"
        >
          <Edit_Svg classname="w-5" />
        </Link>
      </div>
    </div>
  );
}
