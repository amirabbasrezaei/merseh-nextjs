import React from "react";
import { MersehSvg_no_color } from "../SVGS";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen w-full flex-col">
      <MersehSvg_no_color classname="w-28 fill-gray-200 animate-[pulse_1.5s_ease-in-out_infinite] " />

    </div>
  );
}
