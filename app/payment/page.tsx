"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Link from "next/link";
import Success from "@/Components/Payment/Success";
import { trpc } from "@/utils/trpc";
import { Metadata } from "next";
type Props = {};



export default function Payment({}: Props) {
  const router = useRouter();
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

  useEffect(() => {
    if (map.trackId) {
      mutateInquiry({ track_id: map.trackId });
    }
  }, []);

  useEffect(() => {
    console.log(data);
    if (data?.paymentStatus === "PAYED") {
      localStorage.removeItem("shopCart");
    }
  }, [data]);

  return (
    <div className="h-screen w-full gap-5 flex flex-col items-center justify-center">
      {["1", "2"].filter((item) => item === queries.get("status")).length ? (
        <Success />
      ) : null}
      <button
        onClick={() => router.push("/")}
        className="w-fit  px-4 py-2 bg-green1 rounded-lg"
      >
        <span className="text-white">بازگشت به سایت</span>
      </button>
    </div>
  );
}
