import React from "react";
import classNames from "classnames";

type Props = {
  label?: string;
  className?: string;
};

export default function AdminLoading({
  label = "در حال بارگذاری…",
  className,
}: Props) {
  return (
    <div
      className={classNames(
        "flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-6 py-14 text-base text-lightBlack",
        className
      )}
    >
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-green2" />
      {label}
    </div>
  );
}
