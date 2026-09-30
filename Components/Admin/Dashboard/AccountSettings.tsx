"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { trpc } from "@/utils/trpc";
import AdminPanel from "../ui/AdminPanel";
import AdminInput from "../ui/AdminInput";
import AdminButton from "../ui/AdminButton";
import AdminLoading from "../ui/AdminLoading";

export default function AccountSettings() {
  const utils = trpc.useUtils();
  const { data: userInfo, isLoading } = trpc.user.userInfo.useQuery();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneCurrentPassword, setPhoneCurrentPassword] = useState("");
  const [passwordCurrent, setPasswordCurrent] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (userInfo?.phoneNumber) {
      setPhoneNumber(userInfo.phoneNumber);
    }
  }, [userInfo?.phoneNumber]);

  const updatePhone = trpc.user.updateAdminPhone.useMutation({
    onSuccess: async () => {
      toast.success("شماره موبایل به‌روز شد");
      setPhoneCurrentPassword("");
      await utils.user.userInfo.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "خطا در تغییر شماره");
    },
  });

  const updatePassword = trpc.user.updateAdminPassword.useMutation({
    onSuccess: () => {
      toast.success("رمز عبور به‌روز شد");
      setPasswordCurrent("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err) => {
      toast.error(err.message || "خطا در تغییر رمز عبور");
    },
  });

  if (isLoading) {
    return <AdminLoading />;
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
      <AdminPanel
        title="تغییر شماره موبایل"
        description="برای ورود بعدی از شماره جدید استفاده کنید."
      >
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            updatePhone.mutate({
              phoneNumber,
              currentPassword: phoneCurrentPassword,
            });
          }}
        >
          <AdminInput
            label="شماره موبایل"
            dir="ltr"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.currentTarget.value)}
            placeholder="0912..."
            required
          />
          <AdminInput
            label="رمز عبور فعلی"
            type="password"
            dir="ltr"
            value={phoneCurrentPassword}
            onChange={(e) => setPhoneCurrentPassword(e.currentTarget.value)}
            required
          />
          <AdminButton
            type="submit"
            disabled={updatePhone.isPending}
            className="self-start"
          >
            {updatePhone.isPending ? "در حال ذخیره..." : "ذخیره شماره"}
          </AdminButton>
        </form>
      </AdminPanel>

      <AdminPanel
        title="تغییر رمز عبور"
        description="رمز جدید باید حداقل ۶ کاراکتر باشد."
      >
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            updatePassword.mutate({
              currentPassword: passwordCurrent,
              newPassword,
              confirmPassword,
            });
          }}
        >
          <AdminInput
            label="رمز عبور فعلی"
            type="password"
            dir="ltr"
            value={passwordCurrent}
            onChange={(e) => setPasswordCurrent(e.currentTarget.value)}
            required
          />
          <AdminInput
            label="رمز عبور جدید"
            type="password"
            dir="ltr"
            value={newPassword}
            onChange={(e) => setNewPassword(e.currentTarget.value)}
            minLength={6}
            required
          />
          <AdminInput
            label="تکرار رمز عبور جدید"
            type="password"
            dir="ltr"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.currentTarget.value)}
            minLength={6}
            required
          />
          <AdminButton
            type="submit"
            disabled={updatePassword.isPending}
            className="self-start"
          >
            {updatePassword.isPending ? "در حال ذخیره..." : "ذخیره رمز عبور"}
          </AdminButton>
        </form>
      </AdminPanel>
    </div>
  );
}
