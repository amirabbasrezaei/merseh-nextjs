import { trpc } from "@/utils/trpc";
import React, { useEffect, useState } from "react";
import Button from "../../Button";
import { Send_SVG } from "../../SVGS";

export default function NewComment({
  parentCommentId,
  setShowReply,
  articleId,
}: {
  articleId: number;
  parentCommentId: number;
  setShowReply: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [value, setValue] = useState<string | null>(null);
  const {
    data: addCommentData,
    mutate: mutateAddComment,
    isPending: isLoading,
  } = trpc.article.addComment.useMutation();

  const { refetch: refetchComments } = trpc.article.comments.useQuery({
    articleId: Number(articleId),
  });

  useEffect(() => {
    if (addCommentData?.status == "ok") {
      setShowReply(false);
      refetchComments();
    }
  }, [addCommentData]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
      }}
      className="w-full flex flex-col gap-5"
    >
      <textarea
        value={value || ""}
        onChange={(e) => setValue(e.target.value || "")}
        className="appearance-none p-4 w-full sm:w-[500px] h-[100px] outline-none rounded-[10px] border border-[#ECECEC] bg-[#F9F9F9] "
      />
      {value !== null ? (
        <span
          style={{
            visibility:
              value.length < 3 || value.length > 150 ? "visible" : "hidden",
          }}
          className="text-red-800 text-[13px]"
        >
          {value.length < 3
            ? "طول متن حداقل 3 حرف می‌باشد. "
            : value.length > 150
            ? "حداکثر طول متن 150 حرف می‌باشد."
            : ""}
        </span>
      ) : null}
      <div className="flex flex-row gap-5">
        <button
          disabled={value !== null && (value.length < 3 || value.length > 150)}
          onClick={() =>
            mutateAddComment({
              articleId: Number(articleId),
              content: value || "",
              parentCommentId: parentCommentId,
            })
          }
          className="w-fit flex flex-row gap-1 items-center  border border-[#e3e3e3] rounded-[10px] px-4 py-2"
        >
          <span className="text-[16px] text-[#636363] font-[300]">
            ثبت دیدگاه
          </span>
          <Send_SVG classname="fill-green2 w-5 h-auto -rotate-[135deg]" />
        </button>
        <button onClick={() => setShowReply(false)} className="text-gray-600">
          انصراف
        </button>
      </div>
    </form>
  );
}
