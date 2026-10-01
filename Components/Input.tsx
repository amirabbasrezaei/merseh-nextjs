import classNames from "classnames";
import { useId, type HTMLInputTypeAttribute, type InputHTMLAttributes } from "react";
import { useController, type UseControllerProps } from "react-hook-form";
import FieldShell from "./Checkout/FieldShell";
import { fieldClass } from "./Checkout/ui";
import type { FormTypes } from "./Shipping/Address/Add_Address";

interface Props extends UseControllerProps<FormTypes> {
  lableText: string;
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
  className?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  dir?: "ltr" | "rtl";
}

export default function Input({
  lableText,
  type = "text",
  placeholder,
  className,
  inputMode,
  autoComplete,
  dir,
  ...controllerProps
}: Props) {
  const id = useId();
  const { field, fieldState } = useController(controllerProps);
  const error = fieldState.error?.message;

  return (
    <FieldShell
      id={id}
      label={lableText}
      required={Boolean(controllerProps.rules?.required)}
      error={error}
      className={className}
    >
      <input
        {...field}
        id={id}
        type={type}
        dir={dir}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={classNames(fieldClass, "h-12", dir === "ltr" && "text-right")}
      />
    </FieldShell>
  );
}
