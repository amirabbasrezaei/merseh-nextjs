"use client";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { trpc } from "@/utils/trpc";
import classNames from "classnames";
import { Loading_SVG } from "../SVGS";
import { authButtonClass } from "./authStyles";
import { useResetAccountQueries } from "./useResetAccountQueries";

interface Props {
  setLoginStatus: Dispatch<SetStateAction<number>>;
  phoneNumber: string;
  isModal: boolean;
}

const CODE_LENGTH = 5;

export default function Verify({
  phoneNumber,
  setLoginStatus,
  isModal,
}: Props) {
  const {
    mutate: mutateVerifyLoginCode,
    isPending: isLoading,
    data,
    error,
  } = trpc.user.verifyLoginCode.useMutation({ retry: 2 });

  const inputRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState<string>("");
  const resetAccountQueries = useResetAccountQueries();

  useEffect(() => {
    if (data?.accessToken) {
      if (isModal) {
        resetAccountQueries();
      }
    }
  }, [data, error]);

  useEffect(() => {
    if (code.length === CODE_LENGTH) {
      mutateVerifyLoginCode({ code, phoneNumber });
    }
  }, [code]);

  const digits = Array.from({ length: CODE_LENGTH }, (_, index) =>
    code.charAt(index)
  );

  return (
    <div className="flex w-full flex-col items-center">
      <div className="relative w-full">
        <input
          ref={inputRef}
          className="absolute inset-0 z-10 cursor-text opacity-0"
          autoFocus
          value={code}
          onChange={(e) =>
            setCode(e.currentTarget.value.replace(/\D/g, "").slice(0, CODE_LENGTH))
          }
          autoComplete="one-time-code"
          inputMode="numeric"
          maxLength={CODE_LENGTH}
          dir="ltr"
        />
        <div className="flex flex-row justify-center gap-2" dir="ltr">
          {digits.map((digit, index) => {
            const isActive = code.length === index;
            const isFilled = digit.length > 0;
            return (
              <div
                key={index}
                className={classNames(
                  "flex h-12 w-11 items-center justify-center rounded-xl border text-[18px] font-[500] text-black1",
                  isActive
                    ? "border-green2 ring-2 ring-green2/20"
                    : isFilled
                      ? "border-green2/40"
                      : "border-[#E6E6E6]"
                )}
              >
                {digit}
              </div>
            );
          })}
        </div>
      </div>
      <button
        type="button"
        disabled={isLoading || code.length !== CODE_LENGTH}
        onClick={() => mutateVerifyLoginCode({ code, phoneNumber })}
        className={`${authButtonClass(isLoading || code.length !== CODE_LENGTH)} mt-5`}
      >
        {isLoading ? (
          <Loading_SVG classname="h-auto w-8" />
        ) : (
          <span>تائید رمز یکبار مصرف</span>
        )}
      </button>
      <button
        type="button"
        className="mt-4 w-full cursor-pointer text-[13px] text-lightBlack hover:text-green2"
        onClick={() => setLoginStatus(0)}
      >
        تغییر شماره
      </button>
    </div>
  );
}
