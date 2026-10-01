"use client";

import classNames from "classnames";
import { useId, useState, type FormEvent } from "react";
import { trpc } from "@/utils/trpc";
import { buttonClass } from "../Profile/ui/ProfileCard";
import { useThemeStore } from "../ThemeController";
import { describeCoupon, isLoginError, readCheckoutError } from "./format";
import { CloseIcon, TicketIcon } from "./icons";
import type { CheckoutCoupon } from "./types";
import { fieldClass } from "./ui";

type Props = {
  coupon: CheckoutCoupon | null;
  isGuest: boolean;
};

export default function CouponForm({ coupon, isGuest }: Props) {
  const inputId = useId();
  const errorId = useId();
  const utils = trpc.useUtils();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleError = (message: string) => {
    if (isLoginError(message)) useThemeStore.setState({ openAuthModal: true });
    setError(readCheckoutError(message));
  };

  const apply = trpc.order.applyCoupon.useMutation({
    onSuccess: (view) => {
      utils.order.getActiveOrder.setData(undefined, view);
      setCode("");
      setError(null);
    },
    onError: (err) => handleError(err.message),
  });

  const remove = trpc.order.removeCoupon.useMutation({
    onSuccess: (view) => utils.order.getActiveOrder.setData(undefined, view),
    onError: (err) => handleError(err.message),
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    if (isGuest) {
      useThemeStore.setState({ openAuthModal: true });
      setError("برای استفاده از کد تخفیف وارد حساب کاربری شوید.");
      return;
    }
    apply.mutate({ code: trimmed });
  };

  if (coupon) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 rounded-card border border-dashed border-mauve-400 bg-blush-100 px-4 py-3">
          <TicketIcon className="h-5 w-5 flex-none text-mauve-700" />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-small font-medium tracking-wide text-plum-900">
              {coupon.code}
            </span>
            <span className="text-caption text-mauve-700">{describeCoupon(coupon)}</span>
          </div>
          <button
            type="button"
            onClick={() => remove.mutate()}
            disabled={remove.isPending}
            aria-label={`حذف کد ${coupon.code}`}
            className="home-focus home-motion flex h-9 w-9 flex-none items-center justify-center rounded-full text-mauve-700 hover:bg-white disabled:opacity-50"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
        {error ? (
          <p role="alert" className="text-caption text-mauve-700">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2" noValidate>
      <label htmlFor={inputId} className="text-caption font-medium text-plum-900/80">
        کد تخفیف
      </label>
      <div className="flex gap-2">
        <input
          id={inputId}
          value={code}
          onChange={(event) => {
            setCode(event.target.value);
            if (error) setError(null);
          }}
          placeholder="کد را وارد کنید"
          autoComplete="off"
          spellCheck={false}
          maxLength={32}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={classNames(fieldClass, "h-11 min-w-0 flex-1 uppercase placeholder:normal-case")}
        />
        <button
          type="submit"
          disabled={!code.trim() || apply.isPending}
          className={buttonClass("secondary", "px-4 disabled:cursor-not-allowed disabled:opacity-50")}
        >
          {apply.isPending ? "در حال بررسی…" : "اعمال"}
        </button>
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-caption text-mauve-700">
          {error}
        </p>
      ) : null}
    </form>
  );
}
