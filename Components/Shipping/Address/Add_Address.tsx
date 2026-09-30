import React, { useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { trpc } from "@/utils/trpc";
import Input from "@/Components/Input";
import Map from "@/Components/Map/Map";
import SelectInput from "@/Components/SelectInput";
import TextArea from "@/Components/TextArea";
import Button from "@/Components/Button";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";

export type FormTypes = {
  Name: string;
  FamilyName: string;
  AddressTitle: string;
  PhoneNumber: string;
  Province: number;
  City: number;
  Details: string;
  Description: string;
  PostalCode: string;
};

export type Coordinate = {
  longitude: number;
  latitude: number;
};

interface Props {
  setShowAddAddress: React.Dispatch<React.SetStateAction<boolean>>;
  showAddAddress: boolean;
  setSelectedAddress: React.Dispatch<React.SetStateAction<string>>;
}

export default function Add_Address({
  setShowAddAddress,
  showAddAddress,
  setSelectedAddress,
}: Props) {
  const { handleSubmit, control, watch } = useForm<FormTypes>({
    mode: "all",
    defaultValues: {
      Name: "",
      FamilyName: "",
      PhoneNumber: "",
      AddressTitle: "",
      Province: -1,
      City: -1,
      PostalCode: "",
    },
  });
  const [coordinate, setCoordinate] = useState<Coordinate>({
    latitude: 0,
    longitude: 0,
  });
  const { data: getCitiesData } = trpc.shipping.getCities.useQuery({
    provinceId: Number(watch().Province || null),
  });

  const {
    mutate: mutateAddAddress,
    data: addAddressData,
    isPending: isPendingAddAddress,
    error,
  } = trpc.shipping.addAddress.useMutation();

  const onSubmit = (data: any) => {
    const body = {
      phoneNumber: data.PhoneNumber,
      coordinate: {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      },
      reciverInfo: {
        name: data.Name,
        familyName: data.FamilyName,
      },
      provinceId: Number(data.Province),
      cityId: Number(data.City),
      detailedAddress: data.Details,
      postalCode: data.PostalCode,
      addressTitle: data.AddressTitle,
    };

    if (!coordinate.latitude) {
      toast.error("موقیت آدرس را روی نقشه مشخص کنید");
    } else {
      mutateAddAddress(body);
    }
  };

  useEffect(() => {
    console.log(addAddressData);
    if (addAddressData?.status === "ok" && addAddressData?.addressId) {
      setSelectedAddress(addAddressData.addressId);
      setShowAddAddress(false);
    }
  }, [addAddressData]);

  console.log(error);

  return (
    <>
      {createPortal(
        <motion.div
          initial={false}
          variants={{
            open: { opacity: 1, backdropFilter: "blur(4px)" },
            hidden: { opacity: 0, backdropFilter: "blur(0px)" },
          }}
          animate={showAddAddress ? "open" : "hidden"}
          style={{ visibility: showAddAddress ? "visible" : "hidden" }}
          className="fixed sm:absolute z-[40] w-full h-full flex sm:items-center justify-center overflow-y-scroll "
        >
          <form
            style={{ scrollbarWidth: "none" }}
            onSubmit={handleSubmit(onSubmit)}
            className="  rounded-lg flex flex-col items-center border border-[#ececec] sm:justify-center shadow-sm  overflow-y-scroll w-full sm:w-[470px] p-4 h-fit bg-white gap-10 sm:p-4"
          >
            <div className="w-full  flex flex-col items-center gap-4 h-[400px] sm:h-[300px] sm:mb-4 ">
              <Map coordinate={coordinate} setCoordinate={setCoordinate} />
              {!coordinate?.latitude ? (
                <span className="text-red-700 text-[16px]">
                  لطفا موقعیت آدرس را روی نقشه مشخص کنید
                  <span className="text-red-700">*</span>
                </span>
              ) : null}
            </div>

            <div className="sm:grid grid-cols-2 flex flex-col  h-fit w-full gap-5">
              <h3 className="text-[16px] text-black1 w-full col-span-2 ">
                اطلاعات ارسال
              </h3>
              <Input
                control={control}
                type="text"
                lableText="عنوان آدرس"
                name="AddressTitle"
                rules={{ min: 3, required: false }}
                className="w-full"
              />

              <SelectInput
                data={getCitiesData?.provinces}
                control={control}
                lableText="استان"
                name="Province"
                rules={{ required: true }}
                placeholder="استان را انتخاب کنید"
                className="w-full"
              />
              <SelectInput
                data={getCitiesData?.cities}
                control={control}
                lableText="شهر"
                name="City"
                rules={{ required: true }}
                placeholder="شهر را انتخاب کنید"
                className="w-full"
              />

              <TextArea
                lableText="آدرس پستی"
                name="Details"
                control={control}
                rules={{ required: true }}
                className="row-span-3 w-full "
              />

              <Input
                control={control}
                type="text"
                lableText="کد پستی"
                name="PostalCode"
                rules={{ required: true, minLength:10, maxLength:10 }}
                className="w-full"
              />
            </div>
            <div>
              <h3 className="text-[16px] text-black1 w-full ">
                اطلاعات تحویل گیرنده (اختیاری)
              </h3>

              <span className="text-[12px] text-lightBlack">
                در صورتی که اطلاعات این بخش وارد نشود، از اطلاعات حساب کاربری
                شما استفاده می‌شود.
              </span>
            </div>
            <div className="sm:grid grid-cols-2 flex h-fit flex-col w-full  gap-7 sm:gap-4">
              <Input
                control={control}
                type="text"
                lableText="نام"
                name="Name"
                className="w-full"
                rules={{ min: 0, required: false }}
              />
              <Input
                control={control}
                type="text"
                lableText="نام خانوادگی"
                name="FamilyName"
                className="w-full"
                rules={{ min: 0, required: false }}
              />
              <Input
                control={control}
                type="text"
                lableText="شماره تلفن همراه"
                name="PhoneNumber"
                className="w-full"
                rules={{ min: 0, required: false }}
              />
            </div>
            <div className="w-full flex md:flex-row-reverse flex-col gap-3">
              <Button
                isLoading={isPendingAddAddress}
                text="ثبت آدرس"
                type="submit"
                className=" w-full bg-green1 text-white"
              />
              <Button
                onClick={() => setShowAddAddress(false)}
                text="بستن"
                type="button"
                className=" w-full   "
                style={{ color: "#323232", backgroundColor: "#f1f1f1" }}
              />
            </div>
          </form>
        </motion.div>,
        document.body
      )}
    </>
  );
}
