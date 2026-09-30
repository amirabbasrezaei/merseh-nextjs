import React from "react";
import classNames from "classnames";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  containerClassName?: string;
};

export default function AdminTextarea({
  label,
  hint,
  className,
  containerClassName,
  id,
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
      <textarea
        id={inputId}
        className={classNames(
          "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-base text-black1 outline-none transition-colors placeholder:text-gray-400 focus:border-green2 focus:ring-2 focus:ring-green2/15",
          className
        )}
        {...props}
      />
      {hint ? <span className="text-sm text-lightBlack">{hint}</span> : null}
    </label>
  );
}
