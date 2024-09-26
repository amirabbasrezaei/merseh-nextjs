import React, { useEffect, useState } from "react";
import Button from "../Button";
import { z } from "zod";
import { trpc } from "@/utils/trpc";
import Comment from "./Comment";
import { AnimatePresence } from "framer-motion";
import PopUp from "../PopUp";
import { themeRecoilStateAtom } from "../ThemeController";
import { useRecoilState } from "recoil";
import { userInfoStoreAtom } from "../UserAuth";
type Props = {
  productId: string;

  commentsRef: React.MutableRefObject<null>;
};

export default function Comments({ productId, commentsRef }: Props) {
  const [commentInput, setCommentInput] = useState("");
  const [showNotRegisteredPopUp, setShowNotRegisteredPopUp] = useState(false);
  const [userInfo] = useRecoilState(userInfoStoreAtom);
  const [themeStore, setThemeStore] = useRecoilState(themeRecoilStateAtom);
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
    <div ref={commentsRef} className="flex flex-col gap-5">
      <h3 className="text-[22px] font-[500] text-black1">دیدگاه ها</h3>
      {isCommentsLoading ? (
        <div></div>
      ) : product_comments_data?.comments?.length ? (
        <div className="flex flex-col gap-5">
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
        <div>
          <span>اولین دیدگاه را شما ثبت کنید</span>
        </div>
      )}
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
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          className="appearance-none p-4 w-full sm:w-[500px] h-[100px] outline-none rounded-[10px] border border-[#ECECEC] bg-[#F9F9F9] "
        />
        <Button
          onClick={() =>
            mutateAddComment({
              content: commentInput,
              productId: Number(productId),
            })
          }
          isDisabled={commentInput.length < 3 || commentInput.length > 150}
          isLoading={false}
          type="submit"
          className="w-[170px] h-[40px]"
          text="ارسال نظر"
        />
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
    </div>
  );
}
