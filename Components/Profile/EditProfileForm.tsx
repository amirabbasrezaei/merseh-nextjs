"use client";

import React, { useId, useState } from "react";
import classNames from "classnames";
import toast from "react-hot-toast";
import { trpc } from "@/utils/trpc";
import type { ProfileUser } from "./types";
import { buttonClass } from "./ui/ProfileCard";

type Props = {
  user: ProfileUser;
  onDone: () => void;
};

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

function Field({ label, hint, className, ...props }: FieldProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-caption font-medium text-plum-900/80">
        {label}
        {props.required ? <span className="text-mauve-600"> *</span> : null}
      </label>
      <input
        id={id}
        className={classNames(
          "h-12 w-full rounded-card border border-hairline bg-ivory px-4 text-body text-plum-900 outline-none transition-colors placeholder:text-lightBlack/60 focus:border-mauve-400 focus:bg-white focus:ring-4 focus:ring-blush-100 disabled:cursor-not-allowed disabled:text-lightBlack",
          className,
        )}
        {...props}
      />
      {hint ? <span className="text-caption text-lightBlack">{hint}</span> : null}
    </div>
  );
}

export default function EditProfileForm({ user, onDone }: Props) {
  const utils = trpc.useUtils();
  const [name, setName] = useState(user.name);
  const [familyName, setFamilyName] = useState(user.familyName ?? "");
  const [email, setEmail] = useState(user.email ?? "");

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: (updated) => {
      utils.user.userInfo.setData(undefined, updated);
      toast.success("اطلاعات حساب به‌روز شد");
      onDone();
    },
    onError: (err) => {
      toast.error(
        err.data?.code === "BAD_REQUEST"
          ? "اطلاعات وارد شده معتبر نیست"
          : err.message || "خطا در ذخیره اطلاعات",
      );
    },
  });

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        updateProfile.mutate({ name, familyName, email });
      }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="نام"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          maxLength={20}
          autoComplete="given-name"
          required
        />
        <Field
          label="نام خانوادگی"
          value={familyName}
          onChange={(e) => setFamilyName(e.currentTarget.value)}
          maxLength={50}
          autoComplete="family-name"
        />
        <Field
          label="شماره موبایل"
          value={user.phoneNumber}
          dir="ltr"
          className="text-right"
          hint="شماره موبایل برای ورود استفاده می‌شود و قابل تغییر نیست."
          disabled
        />
        <Field
          label="ایمیل"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          dir="ltr"
          className="text-right"
          placeholder="name@example.com"
          autoComplete="email"
        />
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onDone}
          disabled={updateProfile.isPending}
          className={buttonClass("secondary")}
        >
          انصراف
        </button>
        <button
          type="submit"
          disabled={updateProfile.isPending}
          className={buttonClass("primary", "sm:min-w-[9rem]")}
        >
          {updateProfile.isPending ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </button>
      </div>
    </form>
  );
}
