import { trpc } from "@/utils/trpc";
import React, { useEffect, useState } from "react";
import AddressItem from "./AddressItem";
import Modal from "../Modal";
import { Plus_Svg } from "../SVGS";
import Add_Address from "./Add_Address";

export default function Addresses() {
  const { data: userAddressData, refetch: refetchUserAddress } =
    trpc.shipping.userAddress.useQuery();
  const [showAddAddress, setShowAddAddress] = useState(false);

  useEffect(() => {
    refetchUserAddress();
  }, [showAddAddress]);
  return (
    <div className="w-full justify-center items-center p-10">
      {userAddressData?.addresses?.length
        ? userAddressData.addresses.map((e, index) => (
            <AddressItem
              key={index}
              addressDetails={e.addressDetails}
              title={e.title}
            />
          ))
        : null}
      <div
        onClick={() => setShowAddAddress(true)}
        className="flex flex-row w-full justify-center items-center gap-1 cursor-pointer"
      >
        <span className="text-green2">افزودن آدرس</span>
        <Plus_Svg classname="w-4 h-auto fill-green2" />
      </div>

      <Modal showPortal={showAddAddress} setClose={setShowAddAddress}>
        <Add_Address />
      </Modal>
    </div>
  );
}
