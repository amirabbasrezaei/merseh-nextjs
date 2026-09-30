import React from "react";
import classNames from "classnames";

type Props = {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
};

export default function AdminPanel({
  title,
  description,
  children,
  className,
  actions,
}: Props) {
  return (
    <section
      className={classNames(
        "rounded-xl border border-gray-200 bg-white",
        className
      )}
    >
      {title || actions ? (
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            {title ? (
              <h3 className="text-base font-semibold text-black1">{title}</h3>
            ) : null}
            {description ? (
              <p className="mt-0.5 text-sm text-lightBlack">{description}</p>
            ) : null}
          </div>
          {actions}
        </div>
      ) : null}
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}
