"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import Link from "next/link";
import Success from "@/Components/Payment/Success";
import { trpc } from "@/utils/trpc";
type Props = {};

export default function Payment({}: Props) {
  const { data, mutate: mutateInquiry } =
    trpc.payment.inquiryPayment.useMutation();
  const PaymentStatusComponents = {
    succuess: { component: () => <Success />, status: [100, 101] },
  };

  const queries = useSearchParams();
  const map: any = {};

  queries
    .toString()
    .split("&")
    .map((x) => x.replace("amp%3B", ""))
    .join("=")
    .split("=")
    .map((x: string, i, array) => {
      if (i % 2 == 0) {
        map[x] = array[i + 1];
      }
    });
  console.log(map);
  useEffect(() => {
    if (map.trackId) {
      mutateInquiry({ track_id: map.trackId });
    }
  }, []);

  useEffect(() => {
    console.log(data)
    if (data?.paymentStatus === "PAYED") {
      localStorage.setItem("shopCart", "");
    }
  }, [data]);

  return (
    <div className="h-full">
      {["1", "2"].filter((item) => item === queries.get("status")).length ? (
        <Success />
      ) : null}
      <Link
        href={`Zipway://account?status=${map.status}&track_id=${map.trackId}&order_id=${map.orderId}`}
      >
        <button className="w-fit  px-4 py-2 bg-blue-500 rounded-lg">
          <span className="text-white">بازگشت به برنامه</span>
        </button>
      </Link>
    </div>
  );
}
