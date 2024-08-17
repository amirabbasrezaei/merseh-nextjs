import { Comment_SVG, Edit_Svg } from "@/Components/SVGS";
import Link from "next/link";
import React from "react";
interface Props {
  user_name: string;
  user_lastName: string;
  section: string;
  sectionName: string;
  id: string;
  status: string;
}

export default function CommentItem({
  user_name,
  user_lastName,
  id,
  section,
  sectionName,
}: Props) {
  return (
    <div className="border flex flex-row w-full p-5 rounded-md justify-between">
      <div className="flex flex-row gap-1">
        <span>{user_name}</span>
        <span>{user_lastName}</span>
      </div>

      <div className="flex flex-row gap-1">
        <span>
          {section === "product"
            ? "محصول"
            : section === "article"
            ? "مقاله"
            : null}
        </span>
        <span>{sectionName}</span>
      </div>
      <div></div>

      <div className="flex flex-row gap-10 items-center">
        <div className="bg-gray-100 rounded-full w-7 h-7 flex items-center justify-center">
          <Edit_Svg classname="w-5" />
        </div>
      </div>
    </div>
  );
}
