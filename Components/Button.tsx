import classNames from "classnames";
import React from "react";

interface Props {
  className?: string;
  onClick?: any;
  text: string;
}

export default function Button({ className, text, onClick }: Props) {
  const classes = `
  bg-green1 text-white cursor-pointer   rounded-[8px]  flex justify-center items-center 
   
    ${className ?? ""}
  `;
  return (
    <div onClick={onClick}  style={{ width: "full", height: "43px" }} className={classes}>
      <span>{text}</span>
    </div>
  );
}
