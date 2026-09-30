import React from "react";
import classNames from "classnames";

type Props = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export default function AdminEmpty({
  title = "موردی یافت نشد",
  description,
  action,
  className,
}: Props) {
  return (
    <div
      className={classNames(
        "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center",
        className
      )}
    >
      <p className="text-base font-medium text-gray-700">{title}</p>
      {description ? (
        <p className="max-w-sm text-base text-lightBlack">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
