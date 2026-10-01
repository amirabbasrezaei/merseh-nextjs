import { create } from "zustand";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/routers/_app";

type ActiveOrderOutput =
  inferRouterOutputs<AppRouter>["order"]["getActiveOrder"];

export type CartPricing = NonNullable<ActiveOrderOutput["price"]>;

export type CartItem = {
  name: string;
  productId: number;
  variationId?: number;
  variationValueId?: number;
  price: number;
  discount?: number;
  freeShipping?: boolean;
  numberOfProduct: number;
  imageUrl?: string;
  variationValueName?: string;
};

export type ShoppingCart = {
  orderitems: CartItem[];
  price?: CartPricing | null;
  activeOrderId?: number;
};

const STORAGE_KEY = "shopCart";

const emptyCart: ShoppingCart = { orderitems: [] };

function readStoredCart(): ShoppingCart {
  if (typeof window === "undefined") return emptyCart;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyCart;
    const parsed = JSON.parse(raw) as Partial<ShoppingCart>;
    return { ...emptyCart, ...parsed, orderitems: parsed.orderitems ?? [] };
  } catch {
    return emptyCart;
  }
}

function writeStoredCart(cart: ShoppingCart) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

type ShoppingCartState = ShoppingCart & {
  setShoppingCart: (
    cart: ShoppingCart | ((prev: ShoppingCart) => ShoppingCart)
  ) => void;
  clearShoppingCart: () => void;
};

function toCart({ orderitems, price, activeOrderId }: ShoppingCartState) {
  return { orderitems, price, activeOrderId };
}

export const useShoppingCartStore = create<ShoppingCartState>((set, get) => ({
  ...readStoredCart(),
  setShoppingCart: (cart) => {
    const next = typeof cart === "function" ? cart(toCart(get())) : cart;
    set(next);
    writeStoredCart(next);
  },
  clearShoppingCart: () => {
    set({ ...emptyCart, price: undefined, activeOrderId: undefined });
    localStorage.removeItem(STORAGE_KEY);
  },
}));
