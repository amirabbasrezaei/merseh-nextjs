import React from "react";
import classNames from "classnames";

type ListProps = {
  children: React.ReactNode;
  className?: string;
};

export function AdminList({ children, className }: ListProps) {
  return (
    <div
      className={classNames(
        "overflow-hidden rounded-xl border border-gray-200 bg-white divide-y divide-gray-100",
        className
      )}
    >
      {children}
    </div>
  );
}

type RowProps = {
  children: React.ReactNode;
  className?: string;
};

export function AdminListRow({ children, className }: RowProps) {
  return (
    <div
      className={classNames(
        "flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      {children}
    </div>
  );
}
