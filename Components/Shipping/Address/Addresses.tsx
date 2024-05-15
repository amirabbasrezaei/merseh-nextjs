import { trpc } from "@/utils/trpc";
import React, { useEffect, useState } from "react";
import AddressItem from "./AddressItem";

import Add_Address from "./Add_Address";
import { Plus_Svg } from "@/Components/SVGS";
import Modal from "@/Components/Modal";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  selectedAddress: string;
  setSelectedAddress: React.Dispatch<React.SetStateAction<string>>;
}

export default function Addresses({
  selectedAddress,
  setSelectedAddress,
}: Props) {
  const {
    data: userAddressData,
    refetch: refetchUserAddress,
    isLoading,
  } = trpc.shipping.userAddress.useQuery();

  const [showAddAddress, setShowAddAddress] = useState(false);

  useEffect(() => {
    refetchUserAddress();
  }, [showAddAddress]);

  useEffect(() => {
    if (userAddressData?.addresses?.length && selectedAddress.length === 0) {
      setSelectedAddress(userAddressData?.addresses[0].id);
    }
  }, [userAddressData]);

  return (
    <div className="w-full justify-center items-center ">
      <h2 className="text-[22px] text-black1 mb-4">آدرس ها</h2>
      <div className="w-full flex flex-col gap-4">
        <AnimatePresence  mode="wait">
          {isLoading
            ? Array.from(Array(3)).map((_,i) => (
                <motion.div
                key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.3 } }}
                  className="animate-pulse bg-gray-100 w-full h-[60px] rounded-[8px]"
                />
              ))
            : userAddressData?.addresses?.length
            ? userAddressData.addresses.map((e, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 1 } }}
                  exit={{ opacity: 0 }}
                >
                  <AddressItem
                    addressDetails={e.addressDetails}
                    title={e.title}
                    addressId={e.id}
                    onSelect={setSelectedAddress}
                    isSelected={e.id === selectedAddress}
                    province={e.Province.name}
                    city={e.city.name}
                  />
                </motion.div>
              ))
            : null}
        </AnimatePresence>
      </div>
      <div
        onClick={() => setShowAddAddress(true)}
        className="flex flex-row w-full mt-5 justify-center items-center gap-1 cursor-pointer"
      >
        <span className="text-green2">افزودن آدرس</span>
        <Plus_Svg classname="w-4 h-auto fill-green2" />
      </div>

      <Modal showPortal={showAddAddress} setClose={setShowAddAddress}>
        <Add_Address setShowAddAddress={setShowAddAddress} />
      </Modal>
    </div>
  );
}
