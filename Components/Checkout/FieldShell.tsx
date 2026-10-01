import classNames from "classnames";
import type { ReactNode } from "react";

type Props = {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
};

export default function FieldShell({
  id,
  label,
  required = false,
  error,
  className,
  children,
}: Props) {
  return (
    <div className={classNames("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-caption font-medium text-plum-900/80">
        {label}
        {required ? <span className="text-mauve-600"> *</span> : null}
      </label>
      {children}
      {error ? (
        <span id={`${id}-error`} role="alert" className="text-caption text-mauve-700">
          {error}
        </span>
      ) : null}
    </div>
  );
}
