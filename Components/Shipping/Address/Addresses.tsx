import classNames from "classnames";
import { useId, useState } from "react";
import { cardClass } from "@/Components/Checkout/ui";
import type { UserAddress } from "@/Components/Checkout/types";
import { buttonClass, SkeletonBlock } from "@/Components/Profile/ui/ProfileCard";
import { Location_Pin, Plus_Svg } from "@/Components/SVGS";
import Add_Address from "./Add_Address";
import AddressItem from "./AddressItem";

interface Props {
  addresses: UserAddress[];
  isLoading: boolean;
  selectedAddressId: string | null;
  onSelect: (addressId: string) => void;
}

export default function Addresses({
  addresses,
  isLoading,
  selectedAddressId,
  onSelect,
}: Props) {
  const headingId = useId();
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [hasOpenedForm, setHasOpenedForm] = useState(false);

  const openForm = () => {
    setHasOpenedForm(true);
    setShowAddAddress(true);
  };

  return (
    <section aria-labelledby={headingId} className={classNames(cardClass, "flex flex-col gap-5")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-blush-100">
            <Location_Pin classname="h-4 w-4 fill-mauve-700" />
          </span>
          <h2 id={headingId} className="text-h3-md font-medium text-plum-900">
            آدرس تحویل
          </h2>
        </div>
        {addresses.length ? (
          <button type="button" onClick={openForm} className={buttonClass("quiet", "h-10 px-4")}>
            <Plus_Svg classname="h-3 w-3 fill-current" />
            آدرس جدید
          </button>
        ) : null}
      </div>

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2">
          <SkeletonBlock className="h-36 rounded-tile" />
          <SkeletonBlock className="h-36 rounded-tile" />
        </div>
      ) : addresses.length ? (
        <div role="radiogroup" aria-labelledby={headingId} className="grid gap-3 md:grid-cols-2">
          {addresses.map((address) => (
            <AddressItem
              key={address.id}
              address={address}
              groupName={headingId}
              isSelected={address.id === selectedAddressId}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-tile border border-dashed border-hairline bg-ivory px-6 py-8 text-center">
          <p className="text-h3-md text-plum-900">هنوز آدرسی ثبت نکرده‌اید</p>
          <p className="max-w-sm text-small text-lightBlack">
            برای ادامه، نشانی تحویل سفارش را ثبت کنید.
          </p>
          <button type="button" onClick={openForm} className={buttonClass("primary")}>
            <Plus_Svg classname="h-3.5 w-3.5 fill-white" />
            افزودن آدرس
          </button>
        </div>
      )}

      {hasOpenedForm ? (
        <Add_Address
          showAddAddress={showAddAddress}
          setShowAddAddress={setShowAddAddress}
          setSelectedAddress={onSelect}
        />
      ) : null}
    </section>
  );
}
