import React, { useEffect, useState } from "react";
import { trpc } from "@/utils/trpc";
import { Eyebrow } from "../Home/ui/SectionHeader";
import Comment from "./Comment";
import { AnimatePresence } from "framer-motion";
import PopUp from "../PopUp";
import { useThemeStore } from "../ThemeController";
import { useUserInfoStore } from "../stores/userInfoStore";
type Props = {
  productId: string;
  commentsRef: React.RefObject<HTMLDivElement | null>;
};

export default function Comments({ productId, commentsRef }: Props) {
  const [commentInput, setCommentInput] = useState("");
  const [showNotRegisteredPopUp, setShowNotRegisteredPopUp] = useState(false);
  const userInfo = useUserInfoStore((s) => s.userInfo);
  const setThemeStore = useThemeStore.setState;
  const {
    data: product_comments_data,
    isLoading: isCommentsLoading,
    refetch,
  } = trpc.product.productComments.useQuery({
    productId: Number(productId),
  });

  const { data: addCommentData, mutate: mutateAddComment } =
    trpc.product.addComment.useMutation();

  useEffect(() => {
    if (addCommentData?.status === "ok") {
      refetch();
    }
  }, [addCommentData]);
  return (
    <div ref={commentsRef} className="flex w-full scroll-mt-36 flex-col gap-4">
      <Eyebrow>خریداران</Eyebrow>
      <h3 className="text-h2 text-plum-900 md:text-h2-md">دیدگاه‌ها</h3>
      {isCommentsLoading ? (
        <div></div>
      ) : product_comments_data?.comments?.length ? (
        <div className="flex max-w-3xl flex-col gap-4">
          {product_comments_data.comments.map(
            ({
              id,
              content,
              likes,
              authorName,
              authorLastName,
              child_comments,
              isLiked,
            }) => (
              <Comment
                authorName={authorName}
                authorLastName={authorLastName || ""}
                content={content}
                key={id}
                likes={likes}
                productId={productId}
                commentId={id}
                childComments={child_comments}
                isLiked={isLiked}
              />
            )
          )}
        </div>
      ) : (
        <p className="text-body text-lightBlack">اولین دیدگاه را شما ثبت کنید</p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className="flex w-full max-w-3xl flex-col gap-4 rounded-panel bg-ivory p-5 sm:p-6"
      >
        <textarea
          onFocus={() => {
            if (userInfo === null) {
              setShowNotRegisteredPopUp(true);
            }
          }}
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          placeholder="دیدگاه خود را بنویسید"
          className="home-focus h-[120px] w-full appearance-none rounded-card border border-hairline bg-white p-4 text-body text-plum-900 outline-none placeholder:text-lightBlack"
        />
        <button
          type="submit"
          disabled={commentInput.length < 3 || commentInput.length > 150}
          onClick={() =>
            mutateAddComment({
              content: commentInput,
              productId: Number(productId),
            })
          }
          className="home-focus home-motion inline-flex h-11 w-fit items-center justify-center rounded-full bg-plum-900 px-5 text-small font-medium text-ivory hover:bg-mauve-700 disabled:cursor-not-allowed disabled:bg-mauve-400"
        >
          ارسال نظر
        </button>
        {addCommentData?.status === "ok" ? (
          <div className="flex flex-col gap-1">
            <strong className="text-small text-plum-900">
              {userInfo?.name || ""} عزیز سپاسگذاریم بابت ثبت دیدگاه ارزشمندت :)
            </strong>
            <span className="text-small text-lightBlack">
              نظر شما پس از تائید توسط مدیر نمایش داده می‌شود.
            </span>
          </div>
        ) : null}
      </form>
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
    </div>
  );
}
