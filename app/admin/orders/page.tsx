"use client";

import Pagination from "@/components/common/Pagination";
import { useToast } from "@/contexts/ToastContext";
import { usePagination } from "@/hooks/usePagination";
import { apiHandler } from "@/lib/apiHandler";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const TABLE_COLUMNS = [
  { key: "id", label: "Order ID", sortable: false },
  { key: "userEmail", label: "User", sortable: true },
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

export default function AdminOrders() {
  const { showError, showSuccess } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [editModal, setEditModal] = useState<{ show: boolean; order: Order | null; newStatus: string }>({
    show: false,
    order: null,
    newStatus: ""
  });
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const pagination = usePagination({
    initialLimit: 10,
    initialSort: "createdAt",
    initialOrder: "desc",
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = pagination.buildQueryParams();
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
    const newOrder =
      pagination.sortBy === column && pagination.sortOrder === "asc"
        ? "desc"
        : "asc";
    pagination.setSortBy(column);
    pagination.setSortOrder(newOrder);
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pagination.setSearch(value), 500);
  };

  const updateOrderStatus = async () => {
    if (!editModal.order || !editModal.newStatus) return;

    try {
      const { data } = await apiHandler.order.updateOrderStatus(
        editModal.order.id,
        editModal.newStatus
      );
      if (data.success) {
        await fetchOrders();
        showSuccess("Order status updated successfully");
        setEditModal({ show: false, order: null, newStatus: "" });
      }
    } catch (error) {
      console.error("Error updating order:", error);
      showError("Failed to update order status");
    }
  };

  const openEditModal = (order: Order) => {
    if (order.status === 'completed' || order.status === 'cancelled') {
      showError('Cannot update completed or cancelled orders');
      return;
    }
    setEditModal({ show: true, order, newStatus: order.status });
  };

  const getStatusColor = (status: string) => {
    return (
      STATUS_COLORS[status as keyof typeof STATUS_COLORS] ||
      STATUS_COLORS.default
    );
  };

  const renderTableHeader = (column: (typeof TABLE_COLUMNS)[0]) => {
    if (!column.sortable) {
      return (
        <th
          key={column.key}
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
        >
          {column.label}
        </th>
      );
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
            <span className="text-blue-600">
              {pagination.sortOrder === "asc" ? "↑" : "↓"}
            </span>
          )}
        </div>
      </th>
    );
  };

  const renderOrderRow = (order: Order) => (
    <tr key={order.id}>
      <td className="px-6 py-4 font-mono text-sm">
        {order.id.substring(0, 8)}...
      </td>
      <td className="px-6 py-4">{order.userEmail || "N/A"}</td>
      <td className="px-6 py-4">${order.total.toFixed(2)}</td>
      <td className="px-6 py-4">
        <span
          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
            order.status
          )}`}
        >
          {order.status}
        </span>
      </td>
      <td className="px-6 py-4">
        {new Date(order.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 space-x-2">
        <Link
          href={`/admin/orders/${order.id}`}
          className="text-blue-600 hover:text-blue-900"
        >
          View
        </Link>
        <button
          onClick={() => openEditModal(order)}
          disabled={order.status === 'completed' || order.status === 'cancelled'}
          className={`text-sm px-2 py-1 rounded ${
            order.status === 'completed' || order.status === 'cancelled'
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-green-600 hover:text-green-900'
          }`}
        >
          Edit
        </button>
      </td>
    </tr>
  );

  useEffect(() => {
    fetchOrders();
  }, [
    pagination.page,
    pagination.search,
    pagination.sortBy,
    pagination.sortOrder,
    status,
  ]);

  useEffect(() => {
    pagination.resetPage();
  }, [pagination.search, status]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold">Orders Management</h1>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search by user email or order ID..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="border rounded px-3 py-2 text-sm sm:text-base"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded px-3 py-2 text-sm sm:text-base"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-4">
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
                  <p className="font-semibold">{order.userEmail || "N/A"}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-bold">${order.total.toFixed(2)}</span>
                <span className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex space-x-2">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="flex-1 text-center bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700"
                >
                  View
                </Link>
                <button
                  onClick={() => openEditModal(order)}
                  disabled={order.status === 'completed' || order.status === 'cancelled'}
                  className={`flex-1 py-2 px-3 rounded text-sm ${
                    order.status === 'completed' || order.status === 'cancelled'
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>{TABLE_COLUMNS.map(renderTableHeader)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    No orders found
                  </td>
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

      {/* Edit Status Modal */}
      {editModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Update Order Status</h3>
            <p className="text-sm text-gray-600 mb-4">
              Order ID: {editModal.order?.id.substring(0, 8)}...
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={editModal.newStatus}
                onChange={(e) => setEditModal(prev => ({ ...prev, newStatus: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={updateOrderStatus}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => setEditModal({ show: false, order: null, newStatus: "" })}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
