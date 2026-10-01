import RadioMark, { choiceCardClass } from "@/Components/Checkout/RadioMark";
import type { UserAddress } from "@/Components/Checkout/types";

interface Props {
  address: UserAddress;
  groupName: string;
  isSelected: boolean;
  onSelect: (addressId: string) => void;
}

export default function AddressItem({ address, groupName, isSelected, onSelect }: Props) {
  const receiver = `${address.reciverName} ${address.reciverFamilyName}`.trim();

  return (
    <label className={choiceCardClass(isSelected)}>
      <input
        type="radio"
        name={groupName}
        value={address.id}
        checked={isSelected}
        onChange={() => onSelect(address.id)}
        className="sr-only"
      />
      <span className="pt-0.5">
        <RadioMark checked={isSelected} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="truncate text-h3-md text-plum-900">
          {address.title.trim() || "آدرس بدون عنوان"}
        </span>
        <span className="text-caption text-lightBlack">
          {address.Province.name}، {address.city.name}
        </span>
        <span className="line-clamp-2 text-small leading-6 text-plum-900/80">
          {address.addressDetails}
        </span>
        <span className="flex flex-wrap gap-x-2 text-caption text-lightBlack">
          {receiver ? <span>{receiver}</span> : null}
          <span dir="ltr">{address.reciverPhoneNumber}</span>
        </span>
      </span>
    </label>
  );
}
