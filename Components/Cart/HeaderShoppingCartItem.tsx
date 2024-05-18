import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import splitNumber from "../utils/splitNumber";
import Link from "next/link";
import { SetterOrUpdater } from "recoil";
import { ShoppingCart } from "./HeaderShoppingCart";
import { trpc } from "@/utils/trpc";

interface Props {
  name: string;
  price: number;
  numberOfProduct: number;
  imageUrl: string;
  variationValueName?: string;
  productId: number;
  setShoppingCartState: SetterOrUpdater<ShoppingCart>;
}

const cartItemAnimation = {
  closed: {
    opacity: 0,
    y: -50,
    height: 0,
    transition: {
      y: { stiffness: 300 },
    },
    transformOrigin: ["0%", "0%", "0%"],
  },
  open: {
    opacity: 1,
    y: 0,
    height: 140,
    transition: {
      y: { stiffness: 1000, velocity: -100 },
    },
  },
};

export default function HeaderShoppingCartItem({
  name,
  price,
  imageUrl,
  variationValueName,
  productId,
  setShoppingCartState,
  numberOfProduct,
}: Props) {
  const { data, isLoading } = trpc.product.productCartInfo.useQuery({
    productId,
  });
  return (
    <Link
      onClick={() => {
        setShoppingCartState((state) => ({ ...state, showCart: false }));
      }}
      className="w-full"
      href={`/product/${productId}`}
    >
      <motion.div
        initial={{ opacity: 0, y: -50, height: 0 }}
        animate={cartItemAnimation.open}
        exit={cartItemAnimation.closed}
        className=" w-full h-[120px] rounded-[10px] flex flex-row items-center px-4"
      >
        <div className="w-full h-fit flex flex-row items-center gap-10 justify-between">
          <div className="flex flex-row items-center gap-4 relative">
            <Image
              alt={imageUrl}
              src={data?.result?.imageUrls[0] || ""}
              width={140}
              height={140}
              quality={100}
              className="w-fit h-[140px]"
              style={{ objectFit: "cover" }}
            />
            <div className="flex flex-row items-center gap-1">
              <span className="text-[14px] text-black1 font-[500]">{name}</span>
              {variationValueName?.length ? (
                <span className="text-[14px] text-black1 font-[500]">
                  {`- ${variationValueName} `}
                </span>
              ) : null}
            </div>
          </div>
          <span>{numberOfProduct}</span>
          <span className="text-[14px] text-black1 font-[500]">
            {splitNumber(price * numberOfProduct)}
          </span>
        </div>
      </motion.div>
    </Link>
  );
}
