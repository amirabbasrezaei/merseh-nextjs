import classNames from "classnames";
import { useId } from "react";
import { useController, type UseControllerProps } from "react-hook-form";
import FieldShell from "./Checkout/FieldShell";
import { fieldClass } from "./Checkout/ui";
import type { FormTypes } from "./Shipping/Address/Add_Address";

type Option = { id: number; name: string };

interface Props extends UseControllerProps<FormTypes> {
  lableText: string;
  data: Option[] | null | undefined;
  placeholder?: string;
  className?: string;
}

export default function SelectInput({
  lableText,
  data,
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
      required={Boolean(controllerProps.rules?.required || controllerProps.rules?.validate)}
      error={error}
      className={className}
    >
      <select
        {...field}
        id={id}
        disabled={!data?.length}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={classNames(fieldClass, "h-12 cursor-pointer appearance-none bg-no-repeat pl-10")}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238A4A55' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundPosition: "left 1rem center",
          backgroundSize: "1rem",
        }}
      >
        <option disabled value={-1}>
          {placeholder}
        </option>
        {data?.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
