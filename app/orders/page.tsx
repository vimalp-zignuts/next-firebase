"use client";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import Pagination from "@/components/common/Pagination";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { usePagination } from "@/hooks/usePagination";
import { apiHandler } from "@/lib/apiHandler";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface Order {
  id: string;
  userId: string;
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

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const TABLE_COLUMNS = [
  { key: "id", label: "Order ID", sortable: false },
  { key: "total", label: "Total", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "createdAt", label: "Date", sortable: true },
  { key: "actions", label: "Actions", sortable: false },
];

const STATUS_COLORS = {
  completed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
  default: "bg-gray-100 text-gray-800",
};

export default function UserOrders() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { showError, showSuccess } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [cancelConfirm, setCancelConfirm] = useState<{ show: boolean; order: Order | null }>({
    show: false,
    order: null,
  });

  const pagination = usePagination({
    initialLimit: 10,
    initialSort: "createdAt",
    initialOrder: "desc",
  });

  const fetchOrders = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const params = pagination.buildQueryParams();
      params.set("userId", "true");
      if (status) params.set("status", status);

      const { data } = await apiHandler.order.getOrders(params);
      setOrders(data.orders || []);
      pagination.setTotal(data.count || 0);
    } catch (error) {
      console.error("Error fetching orders:", error);
      showError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: string) => {
    const newOrder = pagination.sortBy === column && pagination.sortOrder === "asc" ? "desc" : "asc";
    pagination.setSortBy(column);
    pagination.setSortOrder(newOrder);
  };

  const handleCancelOrder = async () => {
    if (!cancelConfirm.order) return;

    try {
      const { data } = await apiHandler.order.updateOrderStatus(cancelConfirm.order.id, "cancelled");
      if (data.success) {
        await fetchOrders();
        showSuccess("Order cancelled successfully");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      showError("Failed to cancel order");
    } finally {
      setCancelConfirm({ show: false, order: null });
    }
  };

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.default;
  };

  const renderTableHeader = (column: typeof TABLE_COLUMNS[0]) => {
    if (!column.sortable) {
      return <th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{column.label}</th>;
    }

    return (
      <th
        key={column.key}
        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 select-none"
        onClick={() => handleSort(column.key)}
      >
        <div className="flex items-center space-x-1">
          <span>{column.label}</span>
          {pagination.sortBy === column.key && (
            <span className="text-blue-600">{pagination.sortOrder === "asc" ? "↑" : "↓"}</span>
          )}
        </div>
      </th>
    );
  };

  const renderOrderRow = (order: Order) => (
    <tr key={order.id}>
      <td className="px-6 py-4 font-mono text-sm">{order.id.substring(0, 8)}...</td>
      <td className="px-6 py-4">${order.total.toFixed(2)}</td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </td>
      <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
      <td className="px-6 py-4 space-x-2">
        <button
          onClick={() => router.push(`/orders/${order.id}`)}
          className="text-blue-600 hover:text-blue-900"
        >
          View
        </button>
        {order.status === "pending" && (
          <button
            onClick={() => setCancelConfirm({ show: true, order })}
            className="text-red-600 hover:text-red-900"
          >
            Cancel
          </button>
        )}
      </td>
    </tr>
  );

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [pagination.page, pagination.sortBy, pagination.sortOrder, status, isAuthenticated]);

  useEffect(() => {
    pagination.resetPage();
  }, [status]);

  if (authLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Please Login</h2>
        <p>You need to be logged in to view your orders.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold">My Orders</h1>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <select 
          value={status} 
          onChange={(e) => setStatus(e.target.value)} 
          className="w-full sm:w-auto border rounded px-3 py-2 text-sm sm:text-base"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-4">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">No orders found</div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-mono text-sm text-gray-600">
                    {order.id.substring(0, 8)}...
                  </p>
                  <p className="text-lg font-bold">${order.total.toFixed(2)}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}
                >
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-3">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => router.push(`/orders/${order.id}`)}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700"
                >
                  View
                </button>
                {order.status === "pending" && (
                  <button
                    onClick={() => setCancelConfirm({ show: true, order })}
                    className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>{TABLE_COLUMNS.map(renderTableHeader)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">Loading...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">No orders found</td>
                </tr>
              ) : (
                orders.map(renderOrderRow)
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        limit={pagination.limit}
        onPageChange={pagination.setPage}
      />

      <ConfirmDialog
        isOpen={cancelConfirm.show}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        confirmText="Cancel Order"
        onConfirm={handleCancelOrder}
        onCancel={() => setCancelConfirm({ show: false, order: null })}
        type="warning"
      />
    </div>
  );
}