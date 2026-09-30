"use client";

import { Chevron_Down } from "@/Components/SVGS";
import { motion } from "framer-motion";
import React, { useState } from "react";
import { AdminListRow } from "../../ui/AdminList";
import AdminButton from "../../ui/AdminButton";

interface Props {
  customer_name: string;
  id: string;
  section: string;
  commentCount?: number;
  province: string;
  city: string;
  phoneNumber: string;
}

export default function Order_item({
  customer_name,
  id,
  province,
  city,
  phoneNumber,
}: Props) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <AdminListRow className="!flex-col !items-stretch">
      <div className="flex flex-row flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
            <span className="text-base text-lightBlack">
              شماره سفارش:{" "}
              <span className="font-medium text-black1" dir="ltr">
                {id}
              </span>
            </span>
            <span className="text-base font-medium text-black1">
              {customer_name}
            </span>
        </div>
        <AdminButton
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails((state) => !state)}
          className="gap-1"
        >
          جزئیات
          <Chevron_Down
            classname={`w-3 fill-current transition-transform ${showDetails ? "rotate-180" : ""}`}
          />
        </AdminButton>
      </div>
      <motion.div
        initial={false}
        variants={{
          open: {
            height: "auto",
            opacity: 1,
            transition: { duration: 0.25 },
          },
          hidden: {
            height: 0,
            opacity: 0,
            transition: { duration: 0.2 },
          },
        }}
        animate={showDetails ? "open" : "hidden"}
        className="overflow-hidden"
      >
        <div className="mt-1 grid grid-cols-1 gap-2 rounded-lg bg-gray-50 p-3 text-base sm:grid-cols-2">
          <div className="flex gap-2">
            <span className="text-lightBlack">نام مشتری:</span>
            <span>{customer_name}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-lightBlack">تلفن:</span>
            <span dir="ltr">{phoneNumber}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-lightBlack">استان:</span>
            <span>{province}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-lightBlack">شهر:</span>
            <span>{city}</span>
          </div>
        </div>
      </motion.div>
    </AdminListRow>
  );
}
