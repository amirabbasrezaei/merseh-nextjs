import classNames from "classnames";
import React from "react";
import { Loading_SVG } from "./SVGS";

interface Props {
  className?: string;
  onClick?: any;
  text: string;
  type?: "submit" | "reset" | "button" | undefined;
  isLoading?: boolean;
}

export default function Button({
  className,
  text,
  onClick,
  type,
  isLoading,
}: Props) {
  const classes = `
  bg-green1 text-white cursor-pointer   rounded-[8px]  flex justify-center items-center ${
    className ?? "h-[43px] w-full"
  }`;
  return (
    <>
      {!isLoading ? (
        <button type={type} onClick={onClick} className={classes}>
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
