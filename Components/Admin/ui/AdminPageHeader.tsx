import React from "react";
import classNames from "classnames";

type Props = {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
  className?: string;
};

export default function AdminPageHeader({
  title,
  description,
  actions,
  filters,
  className,
}: Props) {
  if (!title && !description && !actions && !filters) {
    return null;
  }

  return (
    <div
      className={classNames(
        "mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      {title || description || filters ? (
        <div className="flex min-w-0 flex-col gap-1">
          {title ? (
            <h2 className="text-xl font-semibold text-black1">{title}</h2>
          ) : null}
          {description ? (
            <p className="text-base text-lightBlack">{description}</p>
          ) : null}
          {filters ? (
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {filters}
            </div>
          ) : null}
        </div>
      ) : (
        <div />
      )}
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
