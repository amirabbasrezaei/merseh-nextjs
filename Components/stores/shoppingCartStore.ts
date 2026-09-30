import { create } from "zustand";

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

const defaultCart: ShoppingCart = {
  orderitems: [],
  showCart: false,
  updateActiveOrder: false,
};

function getInitialCart(): ShoppingCart {
  if (typeof window === "undefined") return defaultCart;
  try {
    const raw = localStorage.getItem("shopCart");
    if (!raw) return defaultCart;
    return JSON.parse(raw) as ShoppingCart;
  } catch {
    return defaultCart;
  }
}

function toCart(state: ShoppingCartState): ShoppingCart {
  const { setShoppingCart: _, ...cart } = state;
  return cart;
}

type ShoppingCartState = ShoppingCart & {
  setShoppingCart: (
    cart: ShoppingCart | ((prev: ShoppingCart) => ShoppingCart)
  ) => void;
};

export const useShoppingCartStore = create<ShoppingCartState>((set, get) => ({
  ...getInitialCart(),
  setShoppingCart: (cart) => {
    const next = typeof cart === "function" ? cart(toCart(get())) : cart;
    set(next);
  },
}));
