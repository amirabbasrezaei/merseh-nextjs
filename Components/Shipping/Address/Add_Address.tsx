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
}

export default function Add_Address({
  setShowAddAddress,
  showAddAddress,
}: Props) {
  const { handleSubmit, control, watch } = useForm<FormTypes>({
    mode: "all",
    defaultValues: {
      Name: "",
    },
  });
  const [coordinate, setCoordinate] = useState<Coordinate>({
    latitude: 0,
    longitude: 0,
  });
  const { data: getCitiesData, refetch: refetchGetCities } =
    trpc.shipping.getCities.useQuery({
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
      postalCode: Number(data.PostalCode),
      addressTitle: data.AddressTitle,
    };
    coordinate.latitude && mutateAddAddress(body);
  };

  useEffect(() => {
    if (addAddressData?.status === "ok") {
      setShowAddAddress(false);
    }
  }, [addAddressData]);

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
          className="absolute z-30 w-full h-screen flex xl:items-center justify-center overflow-y-scroll"
        >
          <form
            style={{ scrollbarWidth: "none" }}
            onSubmit={handleSubmit(onSubmit)}
            className="  rounded-lg flex flex-col items-center border border-[#f3f3f3] sm:justify-center   overflow-y-scroll w-full sm:w-[470px] p-4 h-fit bg-white gap-8 sm:p-4"
          >
            <div className="w-full  flex flex-col items-center gap-4 h-[400px] sm:h-[500px] ">
              <Map coordinate={coordinate} setCoordinate={setCoordinate} />
              {!coordinate?.latitude ? (
                <span className="text-red-700 text-[16px]">
                  لطفا موقعیت آدرس را روی نقشه مشخص کنید
                  <span className="text-red-700">*</span>
                </span>
              ) : null}
            </div>

            <h3 className="text-[16px] text-black1 w-full ">اطلاعات ارسال</h3>
            <div className="sm:grid grid-cols-2 flex flex-col  h-fit w-full gap-5">
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
                rules={{ min: 3, required: true, minLength: 10, maxLength: 10 }}
                className="w-full"
              />
            </div>
            <div>
              <h3 className="text-[16px] text-black1 w-full ">
                اطلاعات شخصی تحویل گیرنده
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
                rules={{ min: 3 }}
                className="w-full"
              />
              <Input
                control={control}
                type="text"
                lableText="نام خانوادگی"
                name="FamilyName"
                rules={{ min: 3 }}
                className="w-full"
              />
              <Input
                control={control}
                type="text"
                lableText="شماره تلفن همراه"
                name="PhoneNumber"
                rules={{ min: 3 }}
                className="w-full"
              />
            </div>
            <div className="w-full flex flex-col gap-3">
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
