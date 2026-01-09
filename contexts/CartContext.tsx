"use client";

import { useToast } from "@/contexts/ToastContext";
import { apiHandler } from "@/lib/apiHandler";
import { useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

interface CartItem {
  productId: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
  };
}

interface CartContextType {
  cart: CartItem[];
  loading: boolean;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  refreshCart: () => Promise<void>;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      if (!isAuthenticated) {
        setCart([]);
        return;
      }
      const response = await apiHandler.cart.getCart();
      if (response.data.success) {
        const cartItems = response.data.cart?.items ?? [];
        setCart(cartItems);
        setCount(
          cartItems?.reduce((total: number, item: any) => total + item?.quantity, 0) || 0
        );
        setTotal(
          cartItems?.reduce(
            (sum: number, item: any) =>
              sum + (item.product?.price * item?.quantity || 0),
            0
          )
        );
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      showError("Failed to load cart");
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number) => {
    try {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }
      setLoading(true);
      await apiHandler.cart.addToCart(productId, quantity);
      await fetchCart();
      showSuccess("Product added to cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      showError("Failed to add product to cart");
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }
      setLoading(true);

      await apiHandler.cart.removeFromCart(productId);
      await fetchCart();
      showSuccess("Product removed from cart");
    } catch (error) {
      console.error("Error removing from cart:", error);
      showError("Failed to remove product from cart");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }
      setLoading(true);
      await apiHandler.cart.updateCart(productId, quantity);
      await fetchCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
      showError("Failed to update quantity");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        refreshCart: fetchCart,
        cartCount: count,
        cartTotal: total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
