import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import splitNumber from "../utils/splitNumber";
import Link from "next/link";
import { SetterOrUpdater } from "recoil";
import { ShoppingCart } from "./HeaderShoppingCart";

interface Props {
  name: string;
  price: number;
  numberOfProduct: number;
  imageUrl: string;
  variationValueName?: string;
  productId:number;
  setShoppingCartState: SetterOrUpdater<ShoppingCart>
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
    height: 70,
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
  setShoppingCartState
}: Props) {

  return (
    <Link onClick={() => {setShoppingCartState(state => ({...state, showCart: false}))}} className="w-full" href={`/product/${productId}`}>
    <motion.div
      initial={{ opacity: 0, y: -50, height: 0 }}
      animate={cartItemAnimation.open}
      exit={cartItemAnimation.closed}
      className=" w-full h-[70px] rounded-[10px] flex flex-row items-center px-4"
    >
      <div className="w-full h-[70px] flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          <Image alt={imageUrl} src={imageUrl} width={40} height={40} />
          <div className="flex flex-row items-center gap-1">
            <span className="text-[14px] text-black1 font-[500]">{name}</span>
            {variationValueName?.length ? (
              <span className="text-[14px] text-black1 font-[500]">
                {`- ${variationValueName} `}
              </span>
            ) : null}
          </div>
        </div>
        <span className="text-[14px] text-black1 font-[500]">{splitNumber(price)}</span>
      </div>
    </motion.div>
    </Link>
  );
}
