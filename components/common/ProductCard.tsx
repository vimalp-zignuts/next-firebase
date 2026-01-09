"use client";

import QuantityControl from "@/components/common/QuantityControl";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
  createdAt: Date;
}

interface ProductCardProps {
  product: Product;
  showDescription?: boolean;
}

export default function ProductCard({ product, showDescription = true }: ProductCardProps) {
  const { addToCart, removeFromCart, cart } = useCart();
  const { showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  const isInCart = cart?.find(item => item.productId === product.id);

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      await addToCart(product.id, quantity);
    } catch (error) {
      console.error("Cart operation error:", error);
      showError("Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCart = async () => {
    setLoading(true);
    try {
      await removeFromCart(product.id);
    } catch (error) {
      console.error("Cart operation error:", error);
      showError("Failed to remove from cart");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (value: number) => {
    setQuantity(value);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
      <Link href={`/products/${product.id}`}>
        {product.imageUrl ? (
          <Image
            height={500}
            width={500}
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-40 sm:h-48 object-cover hover:opacity-90 transition-opacity"
          />
        ) : (
          <div className="w-full h-40 sm:h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-sm">No Image</span>
          </div>
        )}
      </Link>

      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <div className="mb-2">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {product.category}
          </span>
        </div>

        <Link href={`/products/${product.id}`}>
          <h3 className="text-base sm:text-lg font-semibold mb-2 hover:text-blue-600 transition-colors line-clamp-2">
            {product.title}
          </h3>
        </Link>

        {showDescription && (
          <p className="text-gray-600 mb-3 line-clamp-2 text-sm flex-1">
            {product.description}
          </p>
        )}

        <div className="mt-auto space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-lg sm:text-xl font-bold text-green-600">
              ${product.price.toFixed(2)}
            </span>
          </div>

          {!isInCart ? (
            <div className="space-y-2">
              <QuantityControl
                quantity={quantity}
                onQuantityChange={updateQuantity}
                className="justify-center"
              />
              <button
                onClick={handleAddToCart}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm sm:text-base"
              >
                {loading ? "Loading..." : "Add to Cart"}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => router.push('/cart')}
                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors text-sm sm:text-base"
              >
                Go to Cart
              </button>
              <button
                onClick={handleRemoveFromCart}
                disabled={loading}
                className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50 transition-colors text-sm sm:text-base"
              >
                {loading ? "Loading..." : "Remove from Cart"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}