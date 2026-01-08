export interface Rating {
  rate: number;
  count: number;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating?: Rating;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  address: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface Order {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  shippingAddress?: string;
  items: CartItem[];
  total: number;
  createdAt: Date | null;
}

export type ProductInput = Omit<Product, "id" | "rating"> & {
  rating?: Rating;
};
