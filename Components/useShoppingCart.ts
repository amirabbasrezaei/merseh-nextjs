import { useEffect } from "react";
import { useThemeStore } from "./ThemeController";
import { useUserInfoStore } from "./stores/userInfoStore";
import {
  useShoppingCartStore,
  type CartItem,
  type ShoppingCart,
} from "./stores/shoppingCartStore";
import { trpc } from "@/utils/trpc";
import { isLoginError } from "./Checkout/format";

export type { ShoppingCart, CartItem };

function isSameLine(
  item: CartItem,
  productId: number,
  variationValueId?: number
) {
  return variationValueId !== undefined
    ? item.variationValueId === variationValueId
    : item.variationValueId === undefined && item.productId === productId;
}

export default function useShoppingCart() {
  const userInfo = useUserInfoStore((s) => s.userInfo);
  const utils = trpc.useUtils();
  const orderitems = useShoppingCartStore((s) => s.orderitems);
  const price = useShoppingCartStore((s) => s.price);
  const activeOrderId = useShoppingCartStore((s) => s.activeOrderId);
  const setShoppingCart = useShoppingCartStore((s) => s.setShoppingCart);

  const { data: activeOrderData } = trpc.order.getActiveOrder.useQuery(
    undefined,
    { retry: false }
  );
  const {
    mutate: mutateActiveOrder,
    error: updateError,
    isPending: isUpdating,
  } = trpc.order.updateActiveOrder.useMutation({
      retry: 2,
      onSuccess: (view) => utils.order.getActiveOrder.setData(undefined, view),
    });

  useEffect(() => {
    const activeOrder = activeOrderData?.activeOrder;
    if (!activeOrder) return;
    setShoppingCart((state) => ({
      ...state,
      orderitems: activeOrder.items,
      price: activeOrderData.price,
      activeOrderId: activeOrder.id,
    }));
  }, [activeOrderData, setShoppingCart]);

  useEffect(() => {
    if (isLoginError(updateError?.message)) {
      useThemeStore.setState({ openAuthModal: true });
    }
  }, [updateError]);

  const commit = (next: CartItem[]) => {
    setShoppingCart((state) => ({ ...state, orderitems: next }));
    if (userInfo) mutateActiveOrder({ selectedProducts: next });
  };

  const changeQuantity = (
    variationValueId: number | undefined,
    productId: number,
    delta: number
  ) => {
    commit(
      orderitems.map((item) =>
        isSameLine(item, productId, variationValueId)
          ? { ...item, numberOfProduct: item.numberOfProduct + delta }
          : item
      )
    );
  };

  const incrementProductNumber = (
    variationValueId: number | undefined,
    productId: number
  ) => changeQuantity(variationValueId, productId, 1);

  const decrementProductNumber = (
    variationValueId: number | undefined,
    productId: number
  ) => changeQuantity(variationValueId, productId, -1);

  const removeProductFromOrder = (
    variationValueId: number | undefined,
    productId: number
  ) => {
    commit(
      orderitems.filter(
        (item) => !isSameLine(item, productId, variationValueId)
      )
    );
  };

  const syncCart = () => {
    if (userInfo && orderitems.length) {
      mutateActiveOrder({ selectedProducts: orderitems });
    }
  };

  const addProduct = async (
    name: string,
    unitPrice: number,
    productId: number,
    variationId?: number,
    variationValueId?: number,
    details?: Pick<CartItem, "discount" | "imageUrl" | "freeShipping">
  ) => {
    const lineVariationValueId = variationId ? variationValueId : undefined;
    const exists = orderitems.some((item) =>
      isSameLine(item, productId, lineVariationValueId)
    );
    if (exists) {
      changeQuantity(lineVariationValueId, productId, 1);
      return;
    }
    commit([
      ...orderitems,
      {
        ...details,
        name,
        price: unitPrice,
        numberOfProduct: 1,
        productId,
        variationId: lineVariationValueId ? variationId : undefined,
        variationValueId: lineVariationValueId,
      },
    ]);
  };

  const getProduct = (productId: number, variationValueId?: number) =>
    orderitems.find((item) => isSameLine(item, productId, variationValueId));

  return {
    incrementProductNumber,
    removeProductFromOrder,
    decrementProductNumber,
    addProduct,
    getProduct,
    syncCart,
    isUpdating,
    price,
    items: orderitems,
    activeOrderId,
    orderView: activeOrderData,
  };
}
