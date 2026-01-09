"use client";

import QuantityControl from "@/components/common/QuantityControl";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import { apiHandler } from "@/lib/apiHandler";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CartPage() {
  const router = useRouter();
  const {
    removeFromCart,
    updateQuantity,
    cart,
    loading,
    cartTotal,
    refreshCart,
  } = useCart();
  const { showError, showSuccess } = useToast();
  const [checkingOut, setCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const { data } = await apiHandler.order.checkout({
        items: cart,
        total: cartTotal,
      });
      if (data.success) {
        showSuccess("Order placed successfully!");
        router.push("/orders");
        refreshCart();
      } else {
        showError(data.error || "Checkout failed");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      showError("Checkout failed");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Shopping Cart</h1>

      {cart.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <p className="text-gray-500 text-base sm:text-lg mb-4">Your cart is empty</p>
          <button
            onClick={() => router.push("/products/list")}
            className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded hover:bg-blue-700 text-sm sm:text-base"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow divide-y">
            {cart.map((item: any) => (
              <div
                key={item.productId}
                className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4"
              >
                <Image
                  height={500}
                  width={500}
                  src={item.product?.imageUrl || "/placeholder.jpg"}
                  alt={item.product?.title}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded flex-shrink-0"
                />
                <div className="flex-1 w-full sm:w-auto">
                  <h3 className="font-semibold text-sm sm:text-base mb-1">{item.product?.title}</h3>
                  <p className="text-gray-600 text-sm sm:text-base">${item.product?.price}</p>
                  <div className="mt-2">
                    <QuantityControl
                      disabled={loading}
                      quantity={item.quantity}
                      onQuantityChange={(newQuantity) =>
                        updateQuantity(item.productId, newQuantity)
                      }
                      className="justify-start"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center w-full sm:w-auto sm:flex-col sm:text-right">
                  <p className="font-semibold text-sm sm:text-base">
                    ${(item.product?.price * item?.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-red-600 hover:text-red-800 text-sm mt-0 sm:mt-2"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg sm:text-xl font-semibold">
                Total: ${cartTotal?.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 disabled:opacity-50 text-sm sm:text-base"
            >
              {checkingOut ? "Processing..." : "Checkout"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
