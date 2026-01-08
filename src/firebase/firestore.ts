import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { CartItem, Order, Product, ProductInput } from "../types/types";

const productsRef = collection(db, "products");
const ordersRef = collection(db, "orders");

const toDateOrNull = (value: unknown): Date | null => {
  if (value && typeof (value as { toDate?: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate();
  }
  return null;
};

const normalizeRating = (rating: Product["rating"] | undefined) =>
  rating ?? { rate: 0, count: 0 };

type OrderUserInfo = {
  email?: string;
  name?: string;
  address?: string;
};

export const subscribeToProducts = (
  onChange: (products: Product[]) => void,
  onError?: (error: Error) => void
) =>
  onSnapshot(
    productsRef,
    (snapshot) => {
      const products = snapshot.docs.map((productDoc) => {
        const data = productDoc.data() as Omit<Product, "id">;
        return {
          id: productDoc.id,
          title: data.title ?? "",
          price: Number(data.price ?? 0),
          description: data.description ?? "",
          category: data.category ?? "",
          image: data.image ?? "",
          rating: normalizeRating(data.rating),
        };
      });
      onChange(products);
    },
    (error) => {
      if (onError) {
        onError(error as Error);
      }
    }
  );

export const createProduct = async (input: ProductInput) => {
  await addDoc(productsRef, {
    ...input,
    price: Number(input.price),
    rating: normalizeRating(input.rating),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateProduct = async (id: string, input: ProductInput) => {
  await updateDoc(doc(productsRef, id), {
    ...input,
    price: Number(input.price),
    rating: normalizeRating(input.rating),
    updatedAt: serverTimestamp(),
  });
};

export const deleteProduct = async (id: string) => {
  await deleteDoc(doc(productsRef, id));
};

export const createOrder = async (
  userId: string,
  items: CartItem[],
  total: number,
  userInfo?: OrderUserInfo
) => {
  const payload: Record<string, unknown> = {
    userId,
    items: items.map((item) => ({
      ...item,
      id: String(item.id),
      rating: normalizeRating(item.rating),
      quantity: Math.max(1, Number(item.quantity) || 1),
    })),
    total: Number(total),
    createdAt: serverTimestamp(),
  };

  if (userInfo?.email) payload.userEmail = userInfo.email;
  if (userInfo?.name) payload.userName = userInfo.name;
  if (userInfo?.address) payload.shippingAddress = userInfo.address;

  await addDoc(ordersRef, payload);
};

export const subscribeToOrders = (
  userId: string,
  onChange: (orders: Order[]) => void,
  onError?: (error: Error) => void
) =>
  onSnapshot(
    query(ordersRef, where("userId", "==", userId), orderBy("createdAt", "desc")),
    (snapshot) => {
      const orders = snapshot.docs.map((orderDoc) => {
        const data = orderDoc.data() as {
          userId?: string;
          userEmail?: string;
          userName?: string;
          shippingAddress?: string;
          items?: CartItem[];
          total?: number;
          createdAt?: unknown;
        };
        return {
          id: orderDoc.id,
          userId: data.userId ?? userId,
          userEmail: data.userEmail,
          userName: data.userName,
          shippingAddress: data.shippingAddress,
          items: Array.isArray(data.items)
            ? data.items.map((item) => ({
                ...item,
                id: String(item.id),
                rating: normalizeRating(item.rating),
                quantity: Math.max(1, Number(item.quantity) || 1),
              }))
            : [],
          total: Number(data.total ?? 0),
          createdAt: toDateOrNull(data.createdAt),
        };
      });
      onChange(orders);
    },
    (error) => {
      if (onError) {
        onError(error as Error);
      }
    }
  );
