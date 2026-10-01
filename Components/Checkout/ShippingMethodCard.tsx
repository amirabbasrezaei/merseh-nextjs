import Image from "next/image";
import { TruckIcon } from "./icons";
import Price from "./Price";
import RadioMark, { choiceCardClass } from "./RadioMark";
import type { ShippingMethod } from "./types";

type Props = {
  method: ShippingMethod;
  groupName: string;
  isSelected: boolean;
  isFree: boolean;
  disabled: boolean;
  onSelect: (methodId: string) => void;
};

export default function ShippingMethodCard({
  method,
  groupName,
  isSelected,
  isFree,
  disabled,
  onSelect,
}: Props) {
  return (
    <label className={choiceCardClass(isSelected, disabled)}>
      <input
        type="radio"
        name={groupName}
        value={method.id}
        checked={isSelected}
        disabled={disabled}
        onChange={() => onSelect(method.id)}
        className="sr-only"
      />
      <span className="flex w-full items-center gap-3">
        <RadioMark checked={isSelected} />
        <span className="relative flex h-11 w-11 flex-none items-center justify-center overflow-hidden rounded-card bg-sand text-mauve-700">
          {method.imageUrl ? (
            <Image src={method.imageUrl} alt="" fill sizes="44px" className="object-cover" />
          ) : (
            <TruckIcon className="h-5 w-5" />
          )}
        </span>
        <span className="min-w-0 flex-1 truncate text-h3-md text-plum-900">{method.name}</span>
        <span className="flex flex-col items-end gap-0.5 text-small">
          {isFree ? (
            <>
              <Price value={method.price} strike className="text-caption" />
              <span className="font-medium text-mauve-700">رایگان</span>
            </>
          ) : (
            <Price value={method.price} className="font-medium text-plum-900" />
          )}
        </span>
      </span>
    </label>
  );
}
