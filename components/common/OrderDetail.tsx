"use client";

import { OrderInterface } from "@/types/DataInterfaces";
import ProductDetail from "./ProductDetail";

interface OrderDetailProps {
  order: OrderInterface;
  showProductImages?: boolean;
  className?: string;
}

export default function OrderDetail({ 
  order, 
  showProductImages = true, 
  className = "" 
}: OrderDetailProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">Order #{order.id}</h3>
          <p className="text-gray-600">
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>

      <div className="space-y-4">
        {order.items.map((item) => (
          <div key={item.productId} className="flex items-center space-x-4 border-b pb-4">
            {showProductImages && (
              <div className="w-16 h-16 flex-shrink-0">
                <ProductDetail 
                  product={item.product} 
                  showFullDescription={false}
                  className="!shadow-none !rounded-md"
                />
              </div>
            )}
            <div className="flex-1">
              <h4 className="font-medium">{item.product.title}</h4>
              <p className="text-gray-600">${item.product.price.toFixed(2)} × {item.quantity}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">
                ${(item.product.price * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Total:</span>
          <span className="text-xl font-bold text-green-600">
            ${order.total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}