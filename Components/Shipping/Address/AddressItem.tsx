import RadioInput from "@/Components/RadioInput";
import React, { Dispatch, SetStateAction } from "react";

interface Props {
  title: string;
  addressDetails: string;
  onSelect: Dispatch<SetStateAction<string>>;
  addressId: string;
  isSelected: boolean;
  province: string;
  city: string;
}

export default function AddressItem({
  addressDetails,
  title,
  onSelect,
  addressId,
  isSelected,
  province,
  city,
}: Props) {
  return (
    <div
      onClick={() => onSelect(addressId)}
      className="w-full cursor-pointer px-6 py-4 h-fit flex flex-row gap-4 border border-[#EAEAEA] rounded-[8px]"
    >
      <RadioInput isChecked={isSelected} />
      <div className="flex flex-col gap-4">
        <span className="text-black1">{title}</span>
        <span className="text-lightBlack text-[14px]">{`${province} , ${city} , ${addressDetails}`}</span>
      </div>
    </div>
  );
}
