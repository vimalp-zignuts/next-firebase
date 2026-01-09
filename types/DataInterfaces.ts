// TypeScript interfaces for e-commerce application data models

export interface ProductInterface {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
  createdAt: Date;
}

export interface CartItemInterface {
  productId: string;
  quantity: number;
  product: ProductInterface;
}

export interface CartInterface {
  userId: string;
  items: CartItemInterface[];
  updatedAt: Date;
}

export interface OrderInterface {
  id: string;
  userId: string;
  items: CartItemInterface[];
  total: number;
  createdAt: Date;
  status: "pending" | "completed" | "cancelled";
}

export interface UserInterface {
  uid: string;
  email: string;
  role: "admin" | "user";
  createdAt: Date;
}

export interface AuthContextInterface {
  currentUser: UserInterface | null;
  isLoading: boolean;
  loginUser: (email: string, password: string) => Promise<void>;
  registerUser: (email: string, password: string) => Promise<void>;
  logoutUser: () => Promise<void>;
}
