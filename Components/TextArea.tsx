import classNames from "classnames";
import { useId } from "react";
import { useController, type UseControllerProps } from "react-hook-form";
import FieldShell from "./Checkout/FieldShell";
import { fieldClass } from "./Checkout/ui";
import type { FormTypes } from "./Shipping/Address/Add_Address";

interface Props extends UseControllerProps<FormTypes> {
  lableText: string;
  placeholder?: string;
  className?: string;
}

export default function TextArea({
  lableText,
  placeholder,
  className,
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
      <textarea
        {...field}
        id={id}
        rows={3}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={classNames(fieldClass, "resize-none py-3 leading-7")}
      />
    </FieldShell>
  );
}
