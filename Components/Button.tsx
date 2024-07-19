import classNames from "classnames";
import React from "react";
import { Loading_SVG } from "./SVGS";

interface Props {
  className?: string;
  onClick?: any;
  text: string;
  type?: "submit" | "reset" | "button" | undefined;
  isLoading?: boolean;
  isDisabled?: boolean;
  style?: React.CSSProperties | undefined;
}

export default function Button({
  className,
  text,
  onClick,
  type,
  isLoading = false,
  isDisabled = false,
  style,
}: Props) {
  const classes = `
   cursor-pointer  text-white sm:h-[43px] h-[50px] rounded-[8px]  flex justify-center items-center ${
     className ?? " w-full "
   }`;
  return (
    <>
      {!isLoading ? (
        <button
          disabled={isDisabled || isLoading}
          type={type}
          onClick={onClick}
          className={classNames(
            classes,
            isDisabled ? "bg-gray-300" : "bg-green1"
          )}
          style={{ ...style }}
        >
          <span>{text}</span>
        </button>
      ) : (
        <div className="bg-gray-100 h-[43px] w-full text-white cursor-pointer   rounded-[8px]  flex justify-center items-center">
          <Loading_SVG classname="w-7" />
        </div>
      )}
    </>
  );
}
