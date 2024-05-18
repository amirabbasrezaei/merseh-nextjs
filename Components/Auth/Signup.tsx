import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { Loading_SVG } from "../SVGS";
import { trpc } from "@/utils/trpc";

interface Props {
  input: string;
  setLoginStatus: React.Dispatch<React.SetStateAction<number>>;
}
export default function Signup({ input, setLoginStatus }: Props) {
  const {
    data: createUserData,
    isPending: isCreateUserLoading,
    mutate: mutateCreateUser,
  } = trpc.user.createUser.useMutation();
  const utils = trpc.useUtils();
  const [name, setName] = useState("");

  useEffect(() => {
    if (createUserData?.isUserCreated) {
      setLoginStatus(1);
    }
  }, [createUserData]);
  return (
    <div className="flex flex-col gap-3 w-full">
      <span className="text-[#444444] w-full mr-3 mb-1 text-[13px] text-right ">
        لطفا نام خود را وارد کنید:
      </span>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder=""
        type="text"
        className={`flex text-black1 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-[45px] appearance-none rounded-[8px]  w-full px-5 outline-none  border border-[#E6E6E6]`}
      />
      <button
        disabled={isCreateUserLoading}
        onClick={() => {
          mutateCreateUser({
            phoneNumber: input,
            nameAndFamily: name,
          });
        }}
        className={classNames(
          "flex   h-[45px] w-full  rounded-[8px] items-center justify-center text-white ",
          isCreateUserLoading ? "bg-gray-100" : "bg-green1"
        )}
      >
        {!isCreateUserLoading ? (
          <span className="text-[15px]">تائید</span>
        ) : (
          <Loading_SVG classname="w-8 h-auto" />
        )}
      </button>

      {/* <div className="w-[90%]">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="نام و نام خانوادگی"
          className="bg-white border border-gray-100  font-[IRANSansMedium] text-gray-700 focus:bg-white  w-full h-[55] mt-10 rounded-md px-5"
        />
        <button
          onClick={() => {
            mutateCreateUser({
              phoneNumber: input,
              nameAndFamily: name,
            });
          }}
          className={classNames(
            " h-[55]  w-full rounded-md mt-4 justify-center items-center",
            isCreateUserLoading ? "bg-gray-100" : "bg-[#07a2fc]"
          )}
        >
          {isCreateUserLoading ? (
            <div className="bg-gray-100">
              <Loading_SVG classname="w-5 h-auto" />
            </div>
          ) : (
            <span className="font-[IRANSansMedium] text-white">ثبت نام</span>
          )}
        </button>
      </div> */}
    </div>
  );
}
