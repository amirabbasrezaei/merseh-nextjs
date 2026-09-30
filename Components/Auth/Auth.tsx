"use client";
import React, { useEffect, useState } from "react";
import { YekanBakh } from "@/app/fonts";
import { Loading_SVG, MersehSvg, Merseh_typography, XMark_Svg } from "../SVGS";
import { trpc } from "@/utils/trpc";

import Signup from "./Signup";
import Verify from "./Verify";
import { ThemeType } from "../ThemeController";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { authButtonClass, authInputClass } from "./authStyles";

type Props = {
  isModal?: boolean;
  setShowAuthModal?: (
    partial:
      | ThemeType
      | Partial<ThemeType>
      | ((state: ThemeType) => ThemeType | Partial<ThemeType>)
  ) => void;
};

export default function Auth({
  isModal = false,
  setShowAuthModal = () => ({}),
}: Props) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [loginStatus, setLoginStatus] = useState(0);
  const [input, setInput] = useState<string>("");
  const [password, setPassword] = useState("");
  const [usePassword, setUsePassword] = useState(false);
  const { data, isPending: isLoading, mutate, status, error } =
    trpc.user.sendVerifyCode.useMutation();
  const {
    mutate: loginWithPassword,
    isPending: isPasswordLoading,
    error: passwordError,
  } = trpc.user.loginWithPassword.useMutation({
    onSuccess: async () => {
      if (isModal) {
        await utils.user.userInfo.refetch();
        setShowAuthModal((state) => ({ ...state, openAuthModal: false }));
      } else {
        router.push("/admin");
        router.refresh();
      }
    },
  });

  useEffect(() => {
    if (data?.status == "ok") {
      if (data.isNewUser) {
        setLoginStatus(2);
      } else {
        setLoginStatus(1);
      }
    }
  }, [status]);

  useEffect(() => {
    if (error?.message) {
      toast.error(error?.message || "");
    }
  }, [error]);

  useEffect(() => {
    if (passwordError?.message) {
      toast.error(passwordError.message);
    }
  }, [passwordError]);

  const isSubmitLoading = usePassword ? isPasswordLoading : isLoading;

  const hint =
    loginStatus === 1
      ? `رمز ارسال‌شده به ${input} را وارد کنید.`
      : loginStatus === 2
        ? "برای تکمیل ثبت نام، نام خود را وارد کنید."
        : usePassword
          ? "شماره موبایل و رمز عبور خود را وارد کنید."
          : "برای ادامه، شماره موبایل خود را وارد کنید.";

  const card = (
    <div
      onClick={(e) => e.stopPropagation()}
      className="relative flex w-[400px] max-w-[calc(100vw-2rem)] flex-col items-center rounded-2xl border border-[#E8E8E8] bg-white px-7 py-8 shadow-[0_16px_48px_rgba(0,0,0,0.08)]"
    >
      {isModal ? (
        <button
          type="button"
          className="absolute left-3 top-3 cursor-pointer rounded-full p-1 hover:bg-hover1"
          onClick={() =>
            setShowAuthModal((state) => ({ ...state, openAuthModal: false }))
          }
          aria-label="بستن"
        >
          <XMark_Svg classname="h-auto w-4 fill-[#777777]" />
        </button>
      ) : null}

      <div className="mb-5 flex flex-col items-center gap-3">
        <div className="flex flex-row items-center gap-2">
          <Merseh_typography classname="h-auto w-24" />
          <MersehSvg classname="h-auto w-7" />
        </div>
        <span
          className={`${YekanBakh.className} text-[16px] font-[600] text-black1`}
        >
          ورود | ثبت نام
        </span>
        <p className="text-center text-[13px] leading-6 text-lightBlack">
          {hint}
        </p>
      </div>

      {loginStatus == 0 ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (usePassword) {
              loginWithPassword({ phoneNumber: input, password });
            } else {
              mutate({ phoneNumber: input });
            }
          }}
          className="flex w-full flex-col gap-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            placeholder="0912..."
            dir="ltr"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            className={authInputClass}
          />
          {usePassword ? (
            <input
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              placeholder="رمز عبور"
              dir="ltr"
              type="password"
              autoComplete="current-password"
              className={authInputClass}
            />
          ) : null}
          <button
            disabled={isSubmitLoading}
            type="submit"
            className={authButtonClass(isSubmitLoading)}
          >
            {!isSubmitLoading ? (
              <span>
                {usePassword ? "ورود با رمز عبور" : "ارسال رمز یکبار مصرف"}
              </span>
            ) : (
              <Loading_SVG classname="h-auto w-8" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setUsePassword((prev) => !prev)}
            className="w-full cursor-pointer text-center text-[13px] text-lightBlack hover:text-green2"
          >
            {usePassword ? "ورود با رمز یکبار مصرف" : "ورود با رمز عبور"}
          </button>
        </form>
      ) : loginStatus == 1 ? (
        <Verify
          isModal={isModal}
          setLoginStatus={setLoginStatus}
          phoneNumber={input}
        />
      ) : (
        <Signup setLoginStatus={setLoginStatus} input={input} />
      )}
    </div>
  );

  if (isModal) {
    return card;
  }

  return (
    <div
      className="flex h-full w-full items-center justify-center bg-[#F6FAF8] bg-[radial-gradient(ellipse_at_top,_rgba(0,189,132,0.12),_transparent_55%)]"
    >
      {card}
    </div>
  );
}
