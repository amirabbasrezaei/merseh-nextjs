import React, { useEffect, useState } from "react";

import { useForm } from "react-hook-form";

import { trpc } from "@/utils/trpc";
import Input from "@/Components/Input";
import Map from "@/Components/Map/Map";
import SelectInput from "@/Components/SelectInput";
import TextArea from "@/Components/TextArea";
import Button from "@/Components/Button";

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
}

export default function Add_Address({ setShowAddAddress }: Props) {
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center justify-center w-[470px] h-fit bg-white gap-8 p-2 z-10"
    >
      <div className="w-full flex flex-col items-center gap-4 h-[500px] p-3">
        <Map coordinate={coordinate} setCoordinate={setCoordinate} />
        {!coordinate?.latitude ? (
          <span className="text-black1 text-[16px]">
            لطفا موقعیت آدرس را روی نقشه مشخص کنید
            <span className="text-red-700">*</span>
          </span>
        ) : null}
      </div>
      <h3 className="text-[16px] text-black1 w-full">
        اطلاعات شخصی تحویل گیرنده
      </h3>
      <div className="grid grid-cols-2  w-full gap-4">
        <Input
          control={control}
          type="text"
          lableText="نام"
          name="Name"
          rules={{ min: 3, required: true }}
        />
        <Input
          control={control}
          type="text"
          lableText="نام خانوادگی"
          name="FamilyName"
          rules={{ min: 3, required: true }}
        />
      </div>
      <h3 className="text-[16px] text-black1 w-full">اطلاعات ارسال</h3>
      <div className="grid grid-cols-2  w-full gap-4">
        <Input
          control={control}
          type="text"
          lableText="عنوان آدرس"
          name="AddressTitle"
          rules={{ min: 3, required: false }}
        />
        <Input
          control={control}
          type="text"
          lableText="شماره تلفن همراه"
          name="PhoneNumber"
          rules={{ min: 3, required: true }}
        />

        <SelectInput
          data={getCitiesData?.provinces}
          control={control}
          lableText="استان"
          name="Province"
          rules={{ required: true }}
          placeholder="استان را انتخاب کنید"
        />
        <SelectInput
          data={getCitiesData?.cities}
          control={control}
          lableText="شهر"
          name="City"
          rules={{ required: true }}
          placeholder="شهر را انتخاب کنید"
        />

        <TextArea
          lableText="آدرس پستی"
          name="Details"
          control={control}
          rules={{ required: true }}
          className="row-span-3"
        />

        <Input
          control={control}
          type="text"
          lableText="کد پستی"
          name="PostalCode"
          rules={{ min: 3, required: true, minLength: 10, maxLength: 10 }}
        />
      </div>
      <Button
        isLoading={isPendingAddAddress}
        text="ثبت آدرس"
        type="submit"
        className="h-[43px] w-full"
      />
    </form>
  );
}
