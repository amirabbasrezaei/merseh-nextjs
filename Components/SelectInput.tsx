import React, { HTMLAttributes, HTMLInputTypeAttribute } from "react";
import { UseControllerProps, useController } from "react-hook-form";

import { FormTypes } from "./Shipping/Address/Add_Address";

interface Props extends UseControllerProps<FormTypes> {
  className?: HTMLAttributes<HTMLInputElement>["className"];
  placeholder?: string;
  lableText: string;
  data: any[] | null | undefined;
}

export default function SelectInput(props: Props) {
  const { lableText, data, placeholder } = props;
  const { field } = useController(props);

  return (
    <div style={{ height: 50, borderRadius: "10px" }} className=" relative ">
      <select
        
        {...field}
        className="block   w-full bg-white border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
      >
        <option selected className="">
          {placeholder}
        </option>
        {data?.length
          ? data.map((province: any, index) => (
              <option key={index} value={province.id} className="">
                {province.name}
              </option>
            ))
          : null}
      </select>
      <span className="absolute top-[-14px] text-[14px]  right-4  bg-white px-3 text-black1">
        {lableText}
        {props.rules?.required ? <span className="text-red-700">*</span> : null}
      </span>
    </div>
  );
}
