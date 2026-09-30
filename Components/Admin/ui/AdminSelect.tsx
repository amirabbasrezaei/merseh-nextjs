import React from "react";
import classNames from "classnames";

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  containerClassName?: string;
};

export default function AdminSelect({
  label,
  hint,
  className,
  containerClassName,
  id,
  children,
  ...props
}: Props) {
  const inputId = id || props.name;
  return (
    <label
      className={classNames("flex w-full flex-col gap-1.5", containerClassName)}
    >
      {label ? (
        <span className="text-sm font-medium text-gray-600">{label}</span>
      ) : null}
      <select
        id={inputId}
        className={classNames(
          "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-base text-black1 outline-none transition-colors focus:border-green2 focus:ring-2 focus:ring-green2/15",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {hint ? <span className="text-sm text-lightBlack">{hint}</span> : null}
    </label>
  );
}
