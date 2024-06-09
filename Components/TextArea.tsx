import React, {
  DetailedHTMLProps,
  HTMLAttributes,
  HTMLInputTypeAttribute,
  InputHTMLAttributes,
} from "react";
import {
  Control,
  useController,
  UseControllerProps,
  UseFormGetValues,
} from "react-hook-form";
import { FormTypes } from "./Shipping/Address/Add_Address";

interface Props extends UseControllerProps<FormTypes> {
  value?: any;
  setValue?: any;
  className?: HTMLAttributes<HTMLInputElement>["className"];
  formSettings?: DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >;
  placeholder?: string;
  lableText: string;
}

export default function TextArea(props: Props) {
  const { setValue, value, className, formSettings, placeholder, lableText } =
    props;

  const { field, fieldState } = useController(props);

  return (
    <div
      style={{ height: "fit", borderRadius: "10px" }}
      className="row-span-3 relative"
    >
      <textarea
        style={{ height: 100, borderRadius: "10px" }}
        {...field}
        rows={10}
        className={`appearance-none border   border-gray-200 outline-none focus:outline-green1     ${className}`}
        placeholder={placeholder}
      />
      <span className="absolute top-[-14px] text-[14px]  right-4  bg-white px-3 text-black1">
        {lableText}
        {props.rules?.required ? <span className="text-red-700">*</span> : null}
      </span>
    </div>
  );
}
