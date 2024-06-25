import { browser } from "process";
import { useEffect, useState } from "react";
import { atom, useRecoilState } from "recoil";
import { themeRecoilStateAtom } from "./ThemeController";
import { userInfoStoreAtom } from "./UserAuth";
import { trpc } from "@/utils/trpc";

export type ShoppingCart = {
  orderitems:
    | {
        name: string;
        productId: number;
        variationId?: number;
        variationValueId?: number;
        price: number;
        numberOfProduct: number;
        imageUrl?: string;
        variationValueName?: string;
      }[];
  showCart: boolean;
  updateActiveOrder: boolean;
  price?: { totalPrice: number };
  activeOrderId?: number;
};

let local_storage: string = JSON.stringify({
  orderitems: [],
  showCart: false,
  updateActiveOrder: false,
});

if (browser) {
  local_storage = localStorage.getItem("shopCart") || local_storage;
}

export const shopingCartStateAtom = atom<ShoppingCart>({
  key: "ShopingCart",
  default:
    typeof localStorage !== undefined
      ? // @ts-ignore
        JSON.parse(local_storage)
        ? JSON.parse(local_storage)
        : { orderitems: [], showCart: false, updateActiveOrder: false }
      : { orderitems: [], showCart: false, updateActiveOrder: false },
  effects: [],
});

export default function useShoppingCart() {
  const [updateOrder, setUpdateOrder] = useState(false);
  const [_, setThemeStore] = useRecoilState(themeRecoilStateAtom);
  const [userInfo] = useRecoilState(userInfoStoreAtom);

  const { data: activeOrderData, refetch } = trpc.order.getActiveOrder.useQuery(
    undefined,
    {
      retry: false,
    }
  );
  const {
    error: updateActiveOrderError,
    mutate: mutateActiveOrder,
    data: updateActiveOrderData,
  } = trpc.order.updateActiveOrder.useMutation({ retry: 2 });

  const [shoppingCart, setShoppingCart] = useRecoilState(shopingCartStateAtom);

  useEffect(() => {
    refetch().then(() => {
      if (userInfo && updateOrder) {
        mutateActiveOrder({
          selectedProducts:
            shoppingCart.orderitems as ShoppingCart["orderitems"],
        });

        setUpdateOrder(false);
      }
    });
  }, [shoppingCart, userInfo]);

  useEffect(() => {
    if (activeOrderData?.activeOrder) {
      const activeShoppingCart: ShoppingCart["orderitems"] =
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
          imageUrl: product.Product.imageUrls[0],
          variationValueName: product.ProductVariationValue?.name,
        }));

      localStorage.setItem(
        "shopCart",
        JSON.stringify({
          ...shoppingCart,
          orderitems: activeShoppingCart,
          price: activeOrderData.price,
        })
      );
      setUpdateOrder(false);
      setShoppingCart((state: any) => ({
        ...state,
        orderitems: activeShoppingCart,
        price: activeOrderData.price,
        activeOrderId: activeOrderData.activeOrder.id,
      }));
    }
  }, [activeOrderData]);

  useEffect(() => {
    if (
      JSON.parse(updateActiveOrderError?.message || JSON.stringify({ "": "" }))
        .need_login_now
    ) {
      setThemeStore({ openAuthModal: true });
    }
  }, [updateActiveOrderError]);

  useEffect(() => {
    if (updateActiveOrderData?.activeOrder) {
      const activeShoppingCart: ShoppingCart["orderitems"] =
        updateActiveOrderData.activeOrder.ProductForOrder.map((product) => ({
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
          imageUrl: product.Product.imageUrls[0],
          variationValueName: product.ProductVariationValue?.name,
        }));
      localStorage.setItem(
        "shopCart",
        JSON.stringify({
          ...shoppingCart,
          orderitems: activeShoppingCart,
          price: updateActiveOrderData.price,
        })
      );
      setShoppingCart((state: any) => ({
        ...state,
        orderitems: activeShoppingCart,
        price: updateActiveOrderData.price,
      }));
    }
  }, [updateActiveOrderData]);

  const incrementProductNumber = (
    variationValueId: number | undefined,
    productId: number
  ) => {
    if (variationValueId) {
      const newValue = shoppingCart.orderitems.map(
        (prOrder: ShoppingCart["orderitems"][0]) => {
          if (
            prOrder.variationValueId !== undefined &&
            prOrder.variationValueId === variationValueId
          ) {
            return { ...prOrder, numberOfProduct: prOrder.numberOfProduct + 1 };
          }
          return prOrder;
        }
      );
      setUpdateOrder(true);
      setShoppingCart((state) => ({
        ...state,
        orderitems: newValue,
      }));
      return;
    }

    if (productId) {
      const newValue = shoppingCart.orderitems.map(
        (prOrder: ShoppingCart["orderitems"][0]) => {
          if (
            prOrder.productId !== undefined &&
            prOrder.productId === productId
          ) {
            return { ...prOrder, numberOfProduct: prOrder.numberOfProduct + 1 };
          }
          return prOrder;
        }
      );
      setUpdateOrder(true);
      setShoppingCart((state: ShoppingCart) => ({
        ...state,
        orderitems: newValue,
      }));
    }
  };

  const addProduct = async (
    name: string,
    price: number,
    productId: number,
    variationId?: number,
    variationValueId?: number
  ) => {
    const newShoppingCartItem = {
      name,
      price,
      numberOfProduct: 1,
      variationValueId,
      variationId,
      productId,
    };

    const findIndex_On_Variation = shoppingCart.orderitems.findIndex(
      (e) =>
        e.variationValueId !== undefined &&
        e.variationValueId === newShoppingCartItem?.variationValueId
    );
    const findIndex_On_Product = shoppingCart.orderitems.findIndex(
      (e) =>
        e.productId !== undefined &&
        e.productId === newShoppingCartItem?.productId
    );
    if (
      findIndex_On_Variation !== -1 &&
      newShoppingCartItem?.variationValueId
    ) {
      const temp: ShoppingCart["orderitems"] = [
        ...shoppingCart.orderitems.slice(0, findIndex_On_Variation),
        ...shoppingCart.orderitems.slice(findIndex_On_Variation + 1),
        {
          ...shoppingCart.orderitems[findIndex_On_Variation],
          numberOfProduct:
            shoppingCart.orderitems[findIndex_On_Variation].numberOfProduct + 1,
        },
      ];

      const result = {
        ...shoppingCart,
        updateActiveOrder: true,
        orderitems: temp,
      };
      setShoppingCart(result);
      return;
    }

    if (findIndex_On_Product !== -1 && !newShoppingCartItem?.variationValueId) {
      const temp: ShoppingCart["orderitems"] = [
        ...shoppingCart.orderitems.slice(0, findIndex_On_Product),
        ...shoppingCart.orderitems.slice(findIndex_On_Product + 1),
        {
          ...shoppingCart.orderitems[findIndex_On_Product],
          numberOfProduct:
            shoppingCart.orderitems[findIndex_On_Product].numberOfProduct + 1,
        },
      ];

      const result = {
        ...shoppingCart,
        updateActiveOrder: true,
        orderitems: temp,
      };
      setShoppingCart(result);
      return;
    }
    setUpdateOrder(true);
    setShoppingCart((state) => ({
      ...state,
      orderitems: [...state.orderitems, newShoppingCartItem],
    }));

    return shoppingCart.orderitems;
  };

  const decrementProductNumber = (
    variationValueId: number | undefined,
    productId: number
  ) => {
    if (variationValueId) {
      const newValue = shoppingCart.orderitems.map(
        (prOrder: ShoppingCart["orderitems"][0]) => {
          if (prOrder.variationValueId === variationValueId) {
            return { ...prOrder, numberOfProduct: prOrder.numberOfProduct - 1 };
          }
          return prOrder;
        }
      );
      setUpdateOrder(true);
      setShoppingCart((state) => ({
        ...state,
        orderitems: newValue,
      }));
      return;
    }

    if (productId) {
      const newValue = shoppingCart.orderitems.map(
        (prOrder: ShoppingCart["orderitems"][0]) => {
          if (prOrder.productId === productId) {
            return { ...prOrder, numberOfProduct: prOrder.numberOfProduct - 1 };
          }
          return prOrder;
        }
      );
      setUpdateOrder(true);
      setShoppingCart((state: ShoppingCart) => ({
        ...state,
        orderitems: newValue,
      }));
    }
  };

  const removeProductFromOrder = (
    variationValueId: number | undefined,
    productId: number
  ) => {
    if (variationValueId) {
      const remainProducts = shoppingCart.orderitems.filter(
        (pr) => pr.variationValueId !== variationValueId
      );
      setUpdateOrder(true);
      setShoppingCart((state) => ({
        ...state,
        orderitems: remainProducts,
      }));
      return;
    }
    if (productId) {
      const remainProducts = shoppingCart.orderitems.filter(
        (pr) => pr.productId !== productId
      );
      setUpdateOrder(true);
      setShoppingCart((state) => ({
        ...state,
        orderitems: remainProducts,
      }));
    }
  };

  const getProduct = (productId: number, productValueId?: number) => {
    const findProduct = shoppingCart.orderitems.filter((e) => {
      if (
        productValueId !== undefined &&
        productValueId === e.variationValueId
      ) {
        return true;
      }

      if (productValueId === undefined && productId === e.productId) {
        return true;
      }
      return false;
    });

    return findProduct[0];
  };

  return {
    incrementProductNumber,
    removeProductFromOrder,
    decrementProductNumber,
    addProduct,
    getProduct,
    finalPrice: shoppingCart.price?.totalPrice,
    items: shoppingCart.orderitems,
  };
}
