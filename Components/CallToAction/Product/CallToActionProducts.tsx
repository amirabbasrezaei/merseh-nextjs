import React from "react";
import CallToActionProduct, {
  CallToActionProductType,
} from "./CallToActionProduct";

interface Props {
  products: CallToActionProductType[];
}

export default function CallToActionProducts({ products }: Props) {
  return (
    <div className="w-full h-[300px] ">
      {products.map((pr) => (
        <CallToActionProduct
          key={
            pr?.variation_value_id && pr?.variationId
              ? `${pr.variationId}_${pr.variation_value_id}`
              : pr.product_id
          }
          imageurl={pr.imageurl}
          price={pr.price}
          product_id={pr.product_id}
          product_name={pr.product_name}
        />
      ))}
    </div>
  );
}
