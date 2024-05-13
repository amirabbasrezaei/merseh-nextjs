import React from "react";

interface Props {
  title: string;
  addressDetails: string;
}

export default function AddressItem({ addressDetails, title }: Props) {
  return (
    <div className="w-44 h-44">
      <span>{title}</span>
      <span>{addressDetails}</span>
    </div>
  );
}
