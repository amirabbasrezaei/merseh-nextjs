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
import Router from "next/router";
import { useRouter } from "next/navigation";

interface Props {
  setLoginStatus: Dispatch<SetStateAction<number>>;
  phoneNumber: string;
  isModal: boolean;
}

export default function Verify({
  phoneNumber,
  setLoginStatus,
  isModal,
}: Props) {
  const router = useRouter();
  const {
    mutate: mutateVerifyLoginCode,
    isSuccess: isVerifyLoginCodeSuccess,
    isLoading,
    data,
    error,
  } = trpc.user.verifyLoginCode.useMutation({ retry: 2 });

  const inputRef = useRef(null);
  const [code, setCode] = useState<string>("");
  const utils = trpc.useUtils();
  useEffect(() => {
    if (data?.accessToken) {
      if (isModal) {
        utils.user.userInfo.refetch();
      }
    }
  }, [data, error]);

  useEffect(() => {
    if (code.length === 5) {
      mutateVerifyLoginCode({ code, phoneNumber });
    }
  }, [code]);

  return (
    <div className=" justify-center items-center  w-full">
      <div autoFocus className="relative rounded-[8px]   w-full h-[45px]">
        <input
          ref={inputRef}
          className="flex text-black1 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-[45px] appearance-none rounded-[8px]  px-5 outline-none  border border-[#E6E6E6] w-full bg-transparent text-transparent absolute z-20 right-0 top-0 left-0 bottom-0 "
          autoFocus
          value={code}
          onChange={(e) => setCode(e.currentTarget.value)}
          key={"hiddenTextInput"}
          autoComplete="sms-otp"
          maxLength={5}
          dir="ltr"
        />
        <div className="w-full px-3 z-10 h-full justify-evenly items-center flex flex-row-reverse gap-2">
          <div className="basis-1/12 flex h-full rounded-lg justify-center items-center">
            <span className="text-xl  text-gray-500 text-center ">
              {code.length > 0 && code.charAt(0)}
            </span>
          </div>
          <hr className="text-[40px] border-[1px] w-3 border-[#d2d2d2] " />
          <div className="basis-1/12 flex h-full rounded-lg justify-center items-center">
            <span className="text-xl  text-gray-500 text-center ">
              {code.length > 0 && code.charAt(1)}
            </span>
          </div>
          <hr className="text-[40px] border-[1px] w-3 border-[#d2d2d2]" />
          <div className="basis-1/12 flex h-full rounded-lg justify-center items-center">
            <span className="text-xl  text-gray-500 text-center ">
              {code.length > 0 && code.charAt(2)}
            </span>
          </div>
          <hr className="text-[40px] border-[1px] w-3 border-[#d2d2d2]" />

          <div className="basis-1/12 flex h-full rounded-lg justify-center items-center">
            <span className="text-xl  text-gray-500 text-center ">
              {code.length > 0 && code.charAt(3)}
            </span>
          </div>
          <hr className="text-[40px] border-[1px] w-3 border-[#d2d2d2]" />

          <div className="basis-1/12 flex h-full rounded-lg justify-center items-center">
            <span className="text-xl  text-gray-500 text-center ">
              {code.length > 0 && code.charAt(4)}
            </span>
          </div>
        </div>
      </div>
      <button
        onClick={() => mutateVerifyLoginCode({ code, phoneNumber })}
        className={classNames(
          "flex   h-[45px] w-full mt-4 rounded-[8px] items-center justify-center text-white ",
          isLoading ? "" : "bg-green1"
        )}
      >
        <span className=" text-white text-center text-[15px]">
          تائید رمز یکبار مصرف
        </span>
      </button>
      <div
        className="w-full mt-4 cursor-pointer"
        onClick={() => setLoginStatus(0)}
      >
        <span className="text-gray-600 text-[13px]">تغییر شماره</span>
      </div>
    </div>
  );
}
