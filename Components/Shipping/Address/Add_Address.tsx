import classNames from "classnames";
import { motion } from "framer-motion";
import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { trpc } from "@/utils/trpc";
import { CloseIcon } from "@/Components/Checkout/icons";
import Input from "@/Components/Input";
import Map from "@/Components/Map/Map";
import { buttonClass } from "@/Components/Profile/ui/ProfileCard";
import SelectInput from "@/Components/SelectInput";
import TextArea from "@/Components/TextArea";
import useIsClient from "@/Components/utils/useIsClient";

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
  setSelectedAddress?: (addressId: string) => void;
}

const DEFAULT_VALUES: FormTypes = {
  Name: "",
  FamilyName: "",
  AddressTitle: "",
  PhoneNumber: "",
  Province: -1,
  City: -1,
  Details: "",
  Description: "",
  PostalCode: "",
};

const EMPTY_COORDINATE: Coordinate = { latitude: 0, longitude: 0 };

function toLatinDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .trim();
}

const isSelected = (message: string) => (value: unknown) =>
  Number(value) > 0 || message;

export default function Add_Address({
  setShowAddAddress,
  showAddAddress,
  setSelectedAddress,
}: Props) {
  const isClient = useIsClient();
  const titleId = useId();
  const utils = trpc.useUtils();
  const { handleSubmit, control, watch, setValue, reset } = useForm<FormTypes>({
    mode: "onTouched",
    defaultValues: DEFAULT_VALUES,
  });
  const [coordinate, setCoordinate] = useState<Coordinate>(EMPTY_COORDINATE);
  const [showMapError, setShowMapError] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const provinceId = Number(watch("Province"));
  const { data: citiesData } = trpc.shipping.getCities.useQuery({
    provinceId: provinceId > 0 ? provinceId : undefined,
  });

  useEffect(() => {
    setValue("City", -1);
  }, [provinceId, setValue]);

  const close = () => setShowAddAddress(false);

  useEffect(() => {
    if (!showAddAddress) return;
    const opener = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowAddAddress(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      opener?.focus();
    };
  }, [showAddAddress, setShowAddAddress]);

  const addAddress = trpc.shipping.addAddress.useMutation({
    onSuccess: (result) => {
      if (result.status !== "ok" || !result.addressId) {
        toast.error("ثبت آدرس ناموفق بود. دوباره تلاش کنید.");
        return;
      }
      setSelectedAddress?.(result.addressId);
      utils.shipping.userAddress.invalidate();
      toast.success("آدرس ثبت شد");
      reset(DEFAULT_VALUES);
      setCoordinate(EMPTY_COORDINATE);
      setShowMapError(false);
      close();
    },
    onError: () => toast.error("ثبت آدرس ناموفق بود. اطلاعات را بررسی کنید."),
  });

  const onSubmit = (data: FormTypes) => {
    if (!coordinate.latitude) {
      setShowMapError(true);
      return;
    }
    addAddress.mutate({
      phoneNumber: toLatinDigits(data.PhoneNumber),
      coordinate,
      reciverInfo: { name: data.Name.trim(), familyName: data.FamilyName.trim() },
      provinceId: Number(data.Province),
      cityId: Number(data.City),
      detailedAddress: data.Details.trim(),
      postalCode: toLatinDigits(data.PostalCode),
      addressTitle: data.AddressTitle.trim(),
    });
  };

  if (!isClient) return null;

  return createPortal(
    <motion.div
      initial={false}
      animate={showAddAddress ? "open" : "hidden"}
      variants={{
        open: { opacity: 1, visibility: "visible" },
        hidden: { opacity: 0, transitionEnd: { visibility: "hidden" } },
      }}
      transition={{ duration: 0.2 }}
      inert={!showAddAddress}
      onClick={close}
      className="fixed inset-0 z-[60] flex justify-center bg-plum-900/45 sm:items-center sm:p-5"
    >
      <motion.form
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        noValidate
        variants={{ open: { y: 0 }, hidden: { y: 24 } }}
        transition={{ type: "spring", bounce: 0, duration: 0.35 }}
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit(onSubmit, () => setShowMapError(true))}
        className="flex h-[100dvh] w-full max-w-3xl flex-col overflow-hidden bg-white shadow-lift sm:h-[min(52rem,calc(100dvh-2.5rem))] sm:rounded-panel lg:h-[min(50rem,calc(100dvh-2.5rem))] lg:max-w-5xl"
      >
        <header className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-3.5 sm:px-6 sm:py-4">
          <div className="flex min-w-0 flex-col gap-0.5">
            <h2 id={titleId} className="truncate text-h3-md font-medium text-plum-900">
              افزودن آدرس جدید
            </h2>
            <p className="hidden text-caption text-lightBlack sm:block">
              موقعیت روی نقشه، نشانی پستی و در صورت نیاز مشخصات تحویل‌گیرنده.
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={close}
            aria-label="بستن"
            className="home-focus home-motion flex h-10 w-10 flex-none items-center justify-center rounded-full text-mauve-700 hover:bg-blush-100"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain lg:overflow-hidden">
          <div className="flex flex-col lg:h-full lg:flex-row">
            <section className="flex flex-col gap-2 border-b border-hairline px-4 py-4 sm:px-6 lg:min-h-0 lg:w-[min(100%,24rem)] lg:shrink-0 lg:border-b-0 lg:border-e lg:px-5 lg:py-5">
              <h3 className="text-caption font-medium text-mauve-700">
                موقعیت روی نقشه <span className="text-mauve-600">*</span>
              </h3>
              <div
                className={classNames(
                  "h-44 overflow-hidden rounded-card border sm:h-52 lg:h-auto lg:min-h-0 lg:flex-1",
                  showMapError && !coordinate.latitude ? "border-mauve-600" : "border-hairline"
                )}
              >
                <Map coordinate={coordinate} setCoordinate={setCoordinate} />
              </div>
              <p
                role={showMapError && !coordinate.latitude ? "alert" : undefined}
                className={classNames(
                  "text-caption leading-6",
                  coordinate.latitude
                    ? "text-lightBlack"
                    : showMapError
                      ? "text-mauve-700"
                      : "text-lightBlack"
                )}
              >
                {coordinate.latitude
                  ? "موقعیت ثبت شد. برای تغییر، نقطه دیگری را روی نقشه انتخاب کنید."
                  : "روی نقشه بزنید تا موقعیت نشانی مشخص شود."}
              </p>
            </section>

            <div className="flex flex-col gap-6 px-4 py-5 sm:px-6 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-contain lg:py-5">
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <h3 className="text-caption font-medium text-mauve-700 sm:col-span-2">نشانی</h3>
                <Input
                  control={control}
                  name="AddressTitle"
                  lableText="عنوان آدرس"
                  placeholder="مثلاً خانه یا محل کار"
                  className="sm:col-span-2"
                />
                <SelectInput
                  control={control}
                  name="Province"
                  lableText="استان"
                  placeholder="استان را انتخاب کنید"
                  data={citiesData?.provinces}
                  rules={{ validate: isSelected("استان را انتخاب کنید") }}
                />
                <SelectInput
                  control={control}
                  name="City"
                  lableText="شهر"
                  placeholder="شهر را انتخاب کنید"
                  data={citiesData?.cities}
                  rules={{ validate: isSelected("شهر را انتخاب کنید") }}
                />
                <TextArea
                  control={control}
                  name="Details"
                  lableText="نشانی پستی"
                  placeholder="خیابان، کوچه، پلاک و واحد"
                  className="sm:col-span-2"
                  rules={{
                    required: "نشانی را وارد کنید",
                    minLength: { value: 10, message: "نشانی را کامل‌تر بنویسید" },
                  }}
                />
                <Input
                  control={control}
                  name="PostalCode"
                  lableText="کد پستی"
                  placeholder="۱۰ رقم بدون خط تیره"
                  dir="ltr"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  className="sm:col-span-2 sm:max-w-xs"
                  rules={{
                    required: "کد پستی را وارد کنید",
                    validate: (value) =>
                      /^\d{10}$/.test(toLatinDigits(String(value))) ||
                      "کد پستی باید ۱۰ رقم باشد",
                  }}
                />
              </section>

              <section className="grid grid-cols-1 gap-4 border-t border-hairline pt-6 sm:grid-cols-2">
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <h3 className="text-caption font-medium text-mauve-700">
                    تحویل‌گیرنده
                    <span className="ms-1.5 font-normal text-lightBlack">(اختیاری)</span>
                  </h3>
                  <p className="text-caption leading-6 text-lightBlack">
                    اگر خالی بماند، از اطلاعات حساب کاربری شما استفاده می‌شود.
                  </p>
                </div>
                <Input control={control} name="Name" lableText="نام" autoComplete="given-name" />
                <Input
                  control={control}
                  name="FamilyName"
                  lableText="نام خانوادگی"
                  autoComplete="family-name"
                />
                <Input
                  control={control}
                  name="PhoneNumber"
                  lableText="شماره همراه"
                  placeholder="09xxxxxxxxx"
                  type="tel"
                  dir="ltr"
                  inputMode="tel"
                  autoComplete="tel"
                  className="sm:col-span-2 sm:max-w-xs"
                  rules={{
                    validate: (value) =>
                      !String(value).trim() ||
                      /^(\+98|0)?9\d{9}$/.test(toLatinDigits(String(value))) ||
                      "شماره همراه معتبر نیست",
                  }}
                />
              </section>
            </div>
          </div>
        </div>

        <footer className="grid grid-cols-2 gap-3 border-t border-hairline px-4 pb-[calc(0.875rem+env(safe-area-inset-bottom))] pt-3.5 sm:flex sm:justify-start sm:px-6 sm:pb-4">
          <button
            type="submit"
            disabled={addAddress.isPending}
            className={buttonClass("primary", "w-full sm:order-1 sm:w-auto sm:min-w-40")}
          >
            {addAddress.isPending ? "در حال ثبت…" : "ثبت آدرس"}
          </button>
          <button
            type="button"
            onClick={close}
            className={buttonClass("secondary", "w-full sm:order-2 sm:w-auto")}
          >
            انصراف
          </button>
        </footer>
      </motion.form>
    </motion.div>,
    document.body
  );
}
