import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CartItem, Product } from "../types/types";

const STORAGE_KEY = "cart";

const loadCartFromSession = (): CartItem[] => {
  if (typeof sessionStorage === "undefined") return [];
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as CartItem[];
    // Ensure quantity is always a positive number
    return parsed
      .filter((item) => typeof item?.id === "string" || typeof item?.id === "number")
      .map((item) => ({
        ...item,
        id: String(item.id),
        quantity: Math.max(1, Number(item.quantity) || 1),
      }));
  } catch (error) {
    console.error("Failed to parse cart from sessionStorage", error);
    return [];
  }
};

const persistCart = (items: CartItem[]) => {
  if (typeof sessionStorage === "undefined") return;
  if (!items.length) {
    sessionStorage.removeItem(STORAGE_KEY);
    return;
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

type CartState = {
  items: CartItem[];
};

const initialState: CartState = {
  items: loadCartFromSession(),
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Product>) => {
      const existingItem = state.items.find((item) => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      persistCart(state.items);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      persistCart(state.items);
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find((cartItem) => cartItem.id === action.payload.id);
      if (item) {
        item.quantity = Math.max(1, action.payload.quantity);
        persistCart(state.items);
      }
    },
    clearCart: (state) => {
      state.items = [];
      persistCart(state.items);
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
