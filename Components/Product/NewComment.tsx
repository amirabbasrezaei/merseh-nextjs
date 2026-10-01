import { trpc } from "@/utils/trpc";
import React, { useEffect, useState } from "react";
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
        className="home-focus h-[100px] w-full appearance-none rounded-card border border-hairline bg-sand p-4 text-body text-plum-900 outline-none sm:max-w-[500px]"
      />
      {value !== null ? (
        <span
          style={{
            visibility:
              value.length < 3 || value.length > 150 ? "visible" : "hidden",
          }}
          className="text-caption text-mauve-700"
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
          className="home-focus inline-flex w-fit flex-row items-center gap-1 rounded-full border border-hairline px-4 py-2 disabled:opacity-50"
        >
          <span className="text-small text-plum-900">
            ثبت دیدگاه
          </span>
          <Send_SVG classname="h-auto w-5 -rotate-[135deg] fill-mauve-700" />
        </button>
        <button onClick={() => setShowReply(false)} className="home-focus text-small text-lightBlack">
          انصراف
        </button>
      </div>
    </form>
    {addCommentData?.status === "ok" ? (
        <div className="flex w-fit flex-col gap-2 rounded-card border border-hairline bg-ivory p-5">
          <strong className="text-small text-plum-900">
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
                className="home-focus cursor-pointer rounded-full px-4 py-2 hover:bg-blush-100"
              >
                <span className="text-small font-medium text-mauve-700">ورود | ثبت نام</span>
              </div>
            </div>
          </PopUp>
        ) : null}
      </AnimatePresence>
    </>

  );
}
