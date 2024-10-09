import Image from "next/image";
import React from "react";

export interface CallToActionProductType {
  product_name: string;
  product_id: number;
  variationId?: number;
  variation_value_id?: number;
  variation_value_name?: string;
  price: number;
  imageurl: string;
}

export default function CallToActionProduct({
  imageurl,
}: CallToActionProductType) {
  return (
    <div className="w-[200px] h-[200px] relative">
      <Image
        src={imageurl}
        alt={imageurl.split("/").at(-1)?.split(".")[0] || ""}
        quality={100}
        fill
      />
    </div>
  );
}
