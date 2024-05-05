"use client";
import React, { useEffect, useState } from "react";
import { YekanBakh } from "@/app/fonts";
import {
  Loading_SVG,
  MersehSvg,
  Merseh_typography,
  XMark_Svg,
} from "../Home/SVGS";
import { trpc } from "@/utils/trpc";
import classnames from "classnames";

import Signup from "./Signup";
import Verify from "./Verify";
type Props = {
  isModal?: boolean;
  setShowAuthModal?: React.Dispatch<React.SetStateAction<boolean>>;
};
export default function Auth({
  isModal = false,
  setShowAuthModal = () => ({}),
}: Props) {
  const [loginStatus, setLoginStatus] = useState(0);
  const [input, setInput] = useState<string>("");
  const { data, isPending, mutate, status } =
    trpc.user.sendVerifyCode.useMutation();

  useEffect(() => {
    if (data?.status == "ok") {
      if (data.isNewUser) {
        setLoginStatus(2);
      } else {
        setLoginStatus(1);
      }
    }
  }, [status]);
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="h-[280px] relative bg-white w-[320px] flex flex-col  px-6 items-center  border borer-[#DCDCDC] rounded-[8px]"
    >
      {isModal ? (
        <div className="cursor-pointer" onClick={() => setShowAuthModal(false)}>
          <XMark_Svg classname="absolute w-4 h-auto right-2 top-2 fill-[#777777]" />
        </div>
      ) : null}
      <div className="flex flex-row  basis-4/12 items-center justify-between w-full ">
        <span
          className={`${YekanBakh.className} text-[#4e4e4e] font-[600] text-[14px]`}
        >
          ورود | ثبت نام
        </span>
        <div className="flex flex-row items-center gap-2">
          <Merseh_typography classname="w-20 h-auto" />
          <MersehSvg classname="w-6 h-auto" />
        </div>
      </div>
      <div className="basis-1/12"></div>

      {loginStatus == 0 ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className=" flex flex-col gap-3 w-full"
        >
          <span className="text-[#444444] w-full mr-3 mb-1 text-[13px] text-right ">
            لطفا شماره موبایل خود را وارد کنید:
          </span>
          <input
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            placeholder="0912..."
            dir="ltr"
            type="text"
            className={`flex text-black1 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-[45px] appearance-none rounded-[8px]  w-full px-5 outline-none  border border-[#E6E6E6]`}
          />
          <button
            disabled={isPending}
            onClick={() => mutate({ phoneNumber: input })}
            className={classnames(
              "flex   h-[45px] w-full  rounded-[8px] items-center justify-center text-white ",
              isPending ? "bg-gray-100" : "bg-green1"
            )}
          >
            {!isPending ? (
              <span className="text-[15px]">ارسال رمز یکبار مصرف</span>
            ) : (
              <Loading_SVG classname="w-8 h-auto" />
            )}
          </button>
        </form>
      ) : loginStatus == 1 ? (
        <Verify
          isModal={isModal}
          setLoginStatus={setLoginStatus}
          phoneNumber={input}
        />
      ) : (
        <Signup />
      )}

      {/* <Login setAnimationStatus={setAnimationStatus} /> */}
    </div>
  );
}
