import React, { useEffect } from "react";
import { atom, useRecoilState, useRecoilValue } from "recoil";
import { Shop_Cart } from "./SVGS";
import { trpc } from "@/utils/trpc";

type ShoppingCartProduct = {
  name: string;
  productId: number;
  variationId?: number;
  variationValueId?: number;
  price: number;
  numberOfProduct: number;
};

export const shopingCartStateAtom = atom<ShoppingCartProduct[] | null>({
  key: "ShoopingCart",
  default: null,
});

export default function ShoppingCart() {
  const { data: activeOrderData } = trpc.order.getActiveOrder.useQuery();

  const [shopingCartState, setShopingCartState] =
    useRecoilState(shopingCartStateAtom);

  useEffect(() => {

  }, [shopingCartState]);



  useEffect(() => {
    if (activeOrderData?.activeOrder) {
      const activeShoppingCart: ShoppingCartProduct[] =
        activeOrderData.activeOrder.ProductForOrder.map((product) => ({
          name: product.Product.name,
          numberOfProduct: product.numberOfproduct,
          price: product.ProductVariationValue?.price
            ? product.ProductVariationValue.price
            : product.Product.price,
          productId: product.Product.id,
          variationId: product.productVariationId
            ? product.productVariationId
            : undefined,
          variationValueId: product.productVariationValueId
            ? product.productVariationValueId
            : undefined,
        }));
      console.log(activeShoppingCart);
      setShopingCartState(activeShoppingCart);
    }
  }, [activeOrderData]);

  return (
    <div className="p-3 hover:bg-hover1 cursor-pointer rounded-[15px]">
      <Shop_Cart classname=" " />
    </div>
  );
}
