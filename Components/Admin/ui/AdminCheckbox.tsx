import React from "react";
import classNames from "classnames";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  hint?: string;
  containerClassName?: string;
};

export default function AdminCheckbox({
  label,
  hint,
  containerClassName,
  className,
  ...props
}: Props) {
  return (
    <label
      className={classNames(
        "flex cursor-pointer items-start gap-3",
        containerClassName
      )}
    >
      <input
        type="checkbox"
        className={classNames(
          "mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-gray-300 accent-green2",
          className
        )}
        {...props}
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-base font-medium text-black1">{label}</span>
        {hint ? <span className="text-sm text-lightBlack">{hint}</span> : null}
      </span>
    </label>
  );
}
