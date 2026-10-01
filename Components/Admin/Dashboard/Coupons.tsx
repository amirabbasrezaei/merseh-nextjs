"use client";

import { trpc } from "@/utils/trpc";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/routers/_app";
import React, { useState } from "react";
import toast from "react-hot-toast";
import splitNumber from "@/Components/utils/splitNumber";
import AdminBadge from "../ui/AdminBadge";
import AdminButton from "../ui/AdminButton";
import AdminCheckbox from "../ui/AdminCheckbox";
import AdminEmpty from "../ui/AdminEmpty";
import AdminInput from "../ui/AdminInput";
import { AdminList, AdminListRow } from "../ui/AdminList";
import AdminLoading from "../ui/AdminLoading";
import AdminPageHeader from "../ui/AdminPageHeader";
import AdminPanel from "../ui/AdminPanel";
import AdminSelect from "../ui/AdminSelect";

type Coupon =
  inferRouterOutputs<AppRouter>["coupon"]["list"]["coupons"][number];
type CouponType = Coupon["type"];

const TYPE_LABELS: Record<CouponType, string> = {
  FREE_SHIPPING: "ارسال رایگان",
  PERCENT: "درصد تخفیف روی کالا",
  FIXED: "مبلغ ثابت تخفیف روی کالا",
};

type FormState = {
  code: string;
  type: CouponType;
  value: string;
  isActive: boolean;
  expiresOn: string;
  minSubtotal: string;
  usageLimit: string;
};

const EMPTY_FORM: FormState = {
  code: "",
  type: "PERCENT",
  value: "",
  isActive: true,
  expiresOn: "",
  minSubtotal: "",
  usageLimit: "",
};

function toDateInput(value: Date | string | null) {
  if (!value) return "";
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function toFormState(coupon: Coupon): FormState {
  return {
    code: coupon.code,
    type: coupon.type,
    value: coupon.type === "FREE_SHIPPING" ? "" : String(coupon.value),
    isActive: coupon.isActive,
    expiresOn: toDateInput(coupon.expiresAt),
    minSubtotal: coupon.minSubtotal ? String(coupon.minSubtotal) : "",
    usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : "",
  };
}

function optionalNumber(value: string) {
  return value.trim() ? Number(value) : null;
}

function toPayload(form: FormState) {
  return {
    code: form.code,
    type: form.type,
    value: form.type === "FREE_SHIPPING" ? 0 : Number(form.value),
    isActive: form.isActive,
    expiresAt: form.expiresOn
      ? new Date(`${form.expiresOn}T23:59:59`).toISOString()
      : null,
    minSubtotal: optionalNumber(form.minSubtotal),
    usageLimit: optionalNumber(form.usageLimit),
  };
}

function describeCoupon(coupon: Coupon) {
  if (coupon.type === "FREE_SHIPPING") return "ارسال رایگان";
  if (coupon.type === "PERCENT") return `${coupon.value}٪ تخفیف روی کالا`;
  return `${splitNumber(coupon.value)} تومان تخفیف روی کالا`;
}

function isExpired(coupon: Coupon) {
  return Boolean(coupon.expiresAt && new Date(coupon.expiresAt) <= new Date());
}

function readZodMessage(message: string) {
  if (!message.startsWith("[")) return message;
  try {
    const issues = JSON.parse(message) as { message: string }[];
    return issues[0]?.message ?? message;
  } catch {
    return message;
  }
}

function CouponForm({
  coupon,
  onDone,
}: {
  coupon: Coupon | null;
  onDone: () => void;
}) {
  const utils = trpc.useUtils();
  const [form, setForm] = useState<FormState>(
    coupon ? toFormState(coupon) : EMPTY_FORM
  );
  const handlers = {
    onSuccess: () => {
      toast.success(coupon ? "کد تخفیف ذخیره شد" : "کد تخفیف ساخته شد");
      utils.coupon.list.invalidate();
      onDone();
    },
    onError: (error: { message: string }) => toast.error(readZodMessage(error.message)),
  };
  const create = trpc.coupon.create.useMutation(handlers);
  const update = trpc.coupon.update.useMutation(handlers);
  const isPending = create.isPending || update.isPending;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((state) => ({ ...state, [key]: value }));

  return (
    <AdminPanel
      title={coupon ? `ویرایش ${coupon.code}` : "کد تخفیف جدید"}
      className="mb-5"
    >
      <form
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          const payload = toPayload(form);
          if (coupon) update.mutate({ id: coupon.id, ...payload });
          else create.mutate(payload);
        }}
      >
        <AdminInput
          label="کد"
          dir="ltr"
          required
          value={form.code}
          onChange={(event) =>
            set("code", event.currentTarget.value.toUpperCase())
          }
          hint="حروف انگلیسی، عدد، - و _"
        />
        <AdminSelect
          label="نوع"
          value={form.type}
          onChange={(event) =>
            set("type", event.currentTarget.value as CouponType)
          }
        >
          {(Object.keys(TYPE_LABELS) as CouponType[]).map((type) => (
            <option key={type} value={type}>
              {TYPE_LABELS[type]}
            </option>
          ))}
        </AdminSelect>
        {form.type !== "FREE_SHIPPING" ? (
          <AdminInput
            label={form.type === "PERCENT" ? "درصد تخفیف" : "مبلغ تخفیف (تومان)"}
            type="number"
            inputMode="numeric"
            dir="ltr"
            required
            min={1}
            max={form.type === "PERCENT" ? 100 : undefined}
            value={form.value}
            onChange={(event) => set("value", event.currentTarget.value)}
          />
        ) : null}
        <AdminInput
          label="تاریخ انقضا (اختیاری)"
          type="date"
          dir="ltr"
          value={form.expiresOn}
          onChange={(event) => set("expiresOn", event.currentTarget.value)}
          hint="کد تا پایان همین روز معتبر است."
        />
        <AdminInput
          label="حداقل مبلغ سبد (تومان، اختیاری)"
          type="number"
          inputMode="numeric"
          dir="ltr"
          min={1}
          value={form.minSubtotal}
          onChange={(event) => set("minSubtotal", event.currentTarget.value)}
        />
        <AdminInput
          label="حداکثر دفعات استفاده (اختیاری)"
          type="number"
          inputMode="numeric"
          dir="ltr"
          min={1}
          value={form.usageLimit}
          onChange={(event) => set("usageLimit", event.currentTarget.value)}
          hint="فقط پرداخت‌های موفق شمرده می‌شوند."
        />
        <AdminCheckbox
          label="فعال"
          checked={form.isActive}
          onChange={(event) => set("isActive", event.currentTarget.checked)}
          containerClassName="md:col-span-2"
        />
        <div className="flex flex-wrap gap-2 md:col-span-2">
          <AdminButton type="submit" disabled={isPending}>
            {isPending ? "در حال ذخیره…" : coupon ? "ذخیره تغییرات" : "ساخت کد"}
          </AdminButton>
          <AdminButton type="button" variant="secondary" onClick={onDone}>
            انصراف
          </AdminButton>
        </div>
      </form>
    </AdminPanel>
  );
}

export default function Coupons() {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.coupon.list.useQuery();
  const [editing, setEditing] = useState<Coupon | "new" | null>(null);
  const setActive = trpc.coupon.setActive.useMutation({
    onSuccess: () => utils.coupon.list.invalidate(),
    onError: () => toast.error("تغییر وضعیت ناموفق بود"),
  });

  const newButton = (
    <AdminButton onClick={() => setEditing("new")}>کد تخفیف جدید</AdminButton>
  );

  return (
    <div className="flex flex-col">
      <AdminPageHeader
        title="کدهای تخفیف"
        description="هر سفارش فقط یک کد می‌پذیرد: ارسال رایگان یا تخفیف روی مبلغ کالا."
        actions={editing ? null : newButton}
      />

      {editing ? (
        <CouponForm
          key={editing === "new" ? "new" : editing.id}
          coupon={editing === "new" ? null : editing}
          onDone={() => setEditing(null)}
        />
      ) : null}

      {isLoading ? (
        <AdminLoading />
      ) : data?.coupons.length ? (
        <AdminList>
          {data.coupons.map((coupon) => (
            <AdminListRow key={coupon.id}>
              <div className="flex min-w-0 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    dir="ltr"
                    className="font-mono text-base font-semibold text-black1"
                  >
                    {coupon.code}
                  </span>
                  <AdminBadge tone={coupon.isActive ? "success" : "neutral"}>
                    {coupon.isActive ? "فعال" : "غیرفعال"}
                  </AdminBadge>
                  {isExpired(coupon) ? (
                    <AdminBadge tone="warning">منقضی</AdminBadge>
                  ) : null}
                </div>
                <p className="text-sm text-lightBlack">
                  {describeCoupon(coupon)}
                  {coupon.minSubtotal
                    ? ` · خرید بالای ${splitNumber(coupon.minSubtotal)} تومان`
                    : ""}
                  {coupon.expiresAt
                    ? ` · تا ${new Date(coupon.expiresAt).toLocaleDateString("fa-IR")}`
                    : ""}
                  {` · استفاده ${coupon.usedCount}${
                    coupon.usageLimit ? ` از ${coupon.usageLimit}` : ""
                  }`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <AdminButton
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setActive.mutate({
                      id: coupon.id,
                      isActive: !coupon.isActive,
                    })
                  }
                >
                  {coupon.isActive ? "غیرفعال کردن" : "فعال کردن"}
                </AdminButton>
                <AdminButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditing(coupon)}
                >
                  ویرایش
                </AdminButton>
              </div>
            </AdminListRow>
          ))}
        </AdminList>
      ) : editing ? null : (
        <AdminEmpty
          title="کد تخفیفی ثبت نشده است"
          description="کد ارسال رایگان یا تخفیف روی کالا بسازید تا مشتری در سبد خرید وارد کند."
          action={newButton}
        />
      )}
    </div>
  );
}
