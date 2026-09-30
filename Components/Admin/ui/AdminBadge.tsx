import React from "react";
import classNames from "classnames";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

type Props = {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
};

const toneClass: Record<Tone, string> = {
  neutral: "bg-gray-100 text-gray-700",
  success: "bg-green-50 text-green2",
  warning: "bg-amber-50 text-amber-800",
  danger: "bg-red-50 text-red-700",
  info: "bg-sky-50 text-sky-700",
};

export const statusTone = (
  status?: string
): Tone => {
  if (status === "PUBLISHED" || status === "APPROVED" || status === "ACTIVE")
    return "success";
  if (status === "ARCHIVED" || status === "PENDING") return "warning";
  if (status === "REJECTED" || status === "CANCELLED") return "danger";
  return "neutral";
};

export default function AdminBadge({
  children,
  tone = "neutral",
  className,
}: Props) {
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-md px-2 py-0.5 text-sm font-medium",
        toneClass[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
