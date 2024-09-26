"use client";
import React, { useEffect, useState } from "react";
import Button from "../../Button";
import { z } from "zod";
import { trpc } from "@/utils/trpc";
import Comment from "./Comment";
import { useRecoilState } from "recoil";
import { userInfoStoreAtom } from "@/Components/UserAuth";
import PopUp from "@/Components/PopUp";
import { themeRecoilStateAtom } from "@/Components/ThemeController";

type Props = {
  articleId: number;
  commentsRef?: React.MutableRefObject<null>;
};

export default function Comments({ commentsRef, articleId }: Props) {
  const [commentInput, setCommentInput] = useState("");
  const [userInfo] = useRecoilState(userInfoStoreAtom);
  const [showNotRegisteredPopUp, setShowNotRegisteredPopUp] = useState(false);
  const [themeStore, setThemeStore] = useRecoilState(themeRecoilStateAtom);
  console.log(userInfo);

  const {
    data: product_comments_data,
    isLoading: isCommentsLoading,
    refetch,
  } = trpc.article.comments.useQuery({
    articleId: Number(articleId),
  });

  const { data: addCommentData, mutate: mutateAddComment } =
    trpc.article.addComment.useMutation();

  useEffect(() => {
    if (addCommentData?.status === "ok") {
      refetch();
    }
  }, [addCommentData]);

  return (
    <div ref={commentsRef} className="flex flex-col gap-5">
      <label
        htmlFor="mainNewComment"
        className="text-[22px] font-[500] text-black1"
      >
        دیدگاه ها
      </label>
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
                articleId={articleId}
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
          id="mainNewComment"
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          className="appearance-none p-4 w-full sm:w-[500px] h-[100px] outline-none rounded-[10px] border border-[#ECECEC] bg-[#F9F9F9] "
        />
        <Button
          onClick={() =>
            mutateAddComment({
              content: commentInput,
              articleId: Number(articleId),
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
            {userInfo?.name || ""} عزیز سپاسپذاریم بابت ثبت دیدگاه ارزشمندت :)
          </strong>
          <span>نظر شما پس از تائید توسط مدیر نمایش داده می‌شود.</span>
        </div>
      ) : null}

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
    </div>
  );
}
