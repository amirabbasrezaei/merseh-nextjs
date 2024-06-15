import { trpc } from "@/utils/trpc";
import Image from "next/image";
import React from "react";

export default function Orders() {
  const { data, isLoading } = trpc.order.orders.useQuery();
  console.log(data);
  return (
    <div className=" w-full">
      {isLoading ? (
        <div></div>
      ) : data?.orders.length ? (
        data.orders.map((order) => (
          <div className="border w-full gap-3 flex flex-col border-[#e3e3e3] rounded-[8px] p-4">
            <div className="flex flex-row w-full justify-between items-center">
              <div className="flex flex-row gap-1 ">
                <span>شماره سفارش:</span>
                <span>{order.id}</span>
              </div>
              <div className="flex flex-row gap-1 ">
                <span>وضعیت:</span>
                <span className="font-[500] text-green2">
                  {order.status === "ACTIVE"
                    ? "فعال"
                    : order.status === "DELIVERED"
                    ? "ارسال شده"
                    : order.status === "PAYED"
                    ? "پرداخت شده"
                    : order.status === "DELIVERING"
                    ? "در  حال ارسال"
                    : null}
                </span>
              </div>
            </div>
            <div>
              <h4 className="text-lightBlack">محصولات</h4>
              <div
                style={{ scrollbarWidth: "none" }}
                className="flex flex-row overflow-x-scroll"
              >
                {order.ProductForOrder.length
                  ? order.ProductForOrder.map((pr) => (
                      <div>
                        <Image
                          width={100}
                          height={100}
                          alt={
                            pr.Product.imageUrl
                              .split("/")
                              .at(-1)
                              ?.split(".")[0] || ""
                          }
                          src={pr.Product.imageUrl}
                        />
                      </div>
                    ))
                  : null}
              </div>
            </div>
          </div>
        ))
      ) : null}
    </div>
  );
}
