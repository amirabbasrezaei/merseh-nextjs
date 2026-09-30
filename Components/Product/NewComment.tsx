import { trpc } from "@/utils/trpc";
import React, { useEffect, useState } from "react";
import Button from "../Button";
import { Send_SVG } from "../SVGS";
import { AnimatePresence } from "framer-motion";
import PopUp from "../PopUp";
import { useUserInfoStore } from "../stores/userInfoStore";
import { useThemeStore } from "../ThemeController";

export default function NewComment({
  productId,
  parentCommentId,
  setShowReply,
}: {
  productId: string;

  parentCommentId: number;
  setShowReply: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [value, setValue] = useState<string | null>(null);
  const [showNotRegisteredPopUp, setShowNotRegisteredPopUp] = useState(false);
  const userInfo = useUserInfoStore((s) => s.userInfo);
  const setThemeStore = useThemeStore.setState;
  const {
    data: addCommentData,
    mutate: mutateAddComment,
    isPending: isLoading,
  } = trpc.product.addComment.useMutation();

  const { refetch: refetchComments } = trpc.product.productComments.useQuery({
    productId: Number(productId),
  });

  useEffect(() => {
    if (addCommentData?.status == "ok") {
      setShowReply(false);
      refetchComments();
    }
  }, [addCommentData]);

  return (
    <>
    
    
    <form
      onSubmit={(e) => {
        e.preventDefault();
      }}
      className="w-full flex flex-col gap-5"
    >
      <textarea
      onFocus={() => {
        if (userInfo === null) {
          setShowNotRegisteredPopUp(true);
        }
      }}
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
              productId: Number(productId),
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
    {addCommentData?.status === "ok" ? (
        <div className="flex flex-col bg-gray-100 w-fit rounded-md p-5 gap-3">
          <strong className="text-sky-900">
            {userInfo?.name || ""} عزیز سپاسگذاریم بابت ثبت دیدگاه ارزشمندت :)
          </strong>
          <span>نظر شما پس از تائید توسط مدیر نمایش داده می‌شود.</span>
        </div>
      ) : null}
      <AnimatePresence mode="sync">
        {showNotRegisteredPopUp ? (
          <PopUp onClose={() => setShowNotRegisteredPopUp(false)}>
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-fit h-fit flex flex-col items-center justify-center gap-5 py-3"
            >
              <span>لطفا برای ثبت دیدگاه وارد حساب کاربری خود شوید.</span>
              <div
                onClick={() => {
                  setShowNotRegisteredPopUp(false);
                  setThemeStore((state) => ({ ...state, openAuthModal: true }));
                }}
                className=" px-4 py-2 rounded-md cursor-pointer hover:bg-gray-100"
              >
                <span className="text-green2 font-[600]">ورود | ثبت نام</span>
              </div>
            </div>
          </PopUp>
        ) : null}
      </AnimatePresence>
    </>

  );
}
