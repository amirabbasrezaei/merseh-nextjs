import classNames from "classnames";
import React from "react";
import { Check } from "./SVGS";

interface Props {
  isChecked: boolean;
  onCheck?: any;
}

export default function SquareRadioInput({
  isChecked,
  onCheck = () => {},
}: Props) {
  return (
    <div className="w-[17px]  h-[17px] flex items-center justify-center border-2 border-[#DFDFDF] rounded-md p-[1px] ">
      {isChecked ? <div className="bg-green1 rounded-[4px]  w-full  h-full " /> : null}
    </div>
  );
}
