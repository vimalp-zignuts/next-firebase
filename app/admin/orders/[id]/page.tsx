"use client";

import { useAuth } from "@/contexts/AuthContext";
import { apiHandler } from "@/lib/apiHandler";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Order {
  id: string;
  userId: string;
  userEmail?: string;
  items: Array<{
    productId: string;
    quantity: number;
    product: {
      title: string;
      price: number;
    };
  }>;
  total: number;
  status: "pending" | "completed" | "cancelled";
  createdAt: Date;
}

export default function AdminOrderDetail() {
  const { isAdmin, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/");
      return;
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin && params.id) {
      fetchOrder();
    }
  }, [isAdmin, params.id]);

  const fetchOrder = async () => {
    try {
      const { data } = await apiHandler.order.getOrderById(params.id as string);

      if (data.success) {
        // Get user email for admin view
        const { data: userData } = await apiHandler.order.getOrders(
          `search=${data.data.userId}&limit=1`
        );
        const userEmail = userData.orders?.[0]?.userEmail || "Unknown";

        setOrder({ ...data.data, userEmail });
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  if (!isAdmin) return null;

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
        <Link
          href="/admin/orders"
          className="text-blue-600 hover:text-blue-800"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex justify-between items-center">
        <Link
          href="/admin/orders"
          className="text-blue-600 hover:text-blue-800 text-sm sm:text-base"
        >
          ← Back to Orders
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Order Details</h2>
            <div className="space-y-2">
              <p className="text-sm sm:text-base">
                <strong>Order ID:</strong> {order.id}
              </p>
              <p className="text-sm sm:text-base">
                <strong>Customer:</strong> {order.userEmail || "Unknown"}
              </p>
              <p className="text-sm sm:text-base">
                <strong>Status:</strong>
                <span
                  className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </p>
              <p className="text-sm sm:text-base">
                <strong>Order Date:</strong>{" "}
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            <div className="bg-gray-50 p-4 rounded">
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-green-600">
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Order Items</h3>
          
          {/* Mobile Card View */}
          <div className="block sm:hidden space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">{item.product.title}</h4>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Quantity:</span>
                  <span>{item.quantity}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Unit Price:</span>
                  <span>${item.product.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left">
                    Product
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-center">
                    Quantity
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-right">
                    Unit Price
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-right">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-200 px-4 py-2">
                      {item.product.title}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-center">
                      {item.quantity}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-right">
                      ${item.product.price.toFixed(2)}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-right">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-bold">
                  <td
                    colSpan={3}
                    className="border border-gray-200 px-4 py-2 text-right"
                  >
                    Total:
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-right text-green-600">
                    ${order.total.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
