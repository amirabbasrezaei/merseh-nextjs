import { trpc } from "@/utils/trpc";
import React, { useEffect } from "react";
import { Edit_Svg } from "../SVGS";

export default function ProfileInfo() {
  const { data, isLoading } = trpc.user.userInfo.useQuery();
  //   useEffect(() => {
  //     if (data) {
  //       console.log();
  //     }
  //   }, [data]);
  return (
    <div className="flex flex-col gap-3 h-full relative">
      {!isLoading && data ? (
        <>
          <div>
            <span>نام: </span>
            <span>{data.name}</span>
          </div>
          <div>
            <span>نام خانوادگی: </span>
            <span>{data.familyName}</span>
          </div>
          <div>
            <span>شماره موبایل: </span>
            <span>{data.phoneNumber}</span>
          </div>
          <div>
            <span>ایمیل: </span>
            <span>{data.email}</span>
          </div>
        </>
      ) : null}
      <div className="flex bg-green1 rounded-[12px] px-4 py-2  flex-row  items-center gap-1 fixed bottom-[80px] right-[20px]">
        <Edit_Svg classname="w-8 h-auto fill-white" />
        <span className="font-[400] text-white">ویرایش اطلاعات</span>
      </div>
    </div>
  );
}
