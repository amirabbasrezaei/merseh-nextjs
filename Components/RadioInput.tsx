import classNames from "classnames";
import React from "react";

interface Props {
  isChecked: boolean;
  onCheck?: any;
}

export default function RadioInput({ isChecked, onCheck = () => {} }: Props) {
  return (
    <div className="w-[21px]  h-[21px] flex items-center justify-center border-2 border-[#DFDFDF] rounded-full">
      <input
        checked={isChecked}
        onChange={(e) => e.target.checked && onCheck()}
        className={classNames(
          "appearance-none text-center center w-[15px]  h-[15px] rounded-full",
          isChecked ? "checked:bg-green1" : ""
        )}
        type="radio"
      />
    </div>
  );
}
