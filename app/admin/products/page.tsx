"use client";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import Pagination from "@/components/common/Pagination";
import { useProducts } from "@/contexts/ProductContext";
import { useToast } from "@/contexts/ToastContext";
import { usePagination } from "@/hooks/usePagination";
import { apiHandler } from "@/lib/apiHandler";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
  createdAt: Date;
}

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
  { value: "books", label: "Books" },
  { value: "home", label: "Home & Garden" },
  { value: "sports", label: "Sports" },
];

const TABLE_COLUMNS = [
  { key: "title", label: "Title", sortable: true },
  { key: "price", label: "Price", sortable: true },
  { key: "category", label: "Category", sortable: true },
  { key: "createdAt", label: "Created At", sortable: true },
  { key: "actions", label: "Actions", sortable: false },
];

const ACTIONS = [
  {
    href: (id: string) => `/admin/products/${id}`,
    label: "View",
    className: "text-blue-600 hover:text-blue-900",
  },
  {
    href: (id: string) => `/admin/products/update?id=${id}`,
    label: "Edit",
    className: "text-green-600 hover:text-green-900",
  },
];

export default function AdminProducts() {
  const {
    products,
    loading,
    currentPage,
    totalPages,
    total,
    fetchWithPagination,
  } = useProducts();
  const { showError, showSuccess } = useToast();
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    product: Product | null;
  }>({ show: false, product: null });
  const [category, setCategory] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const pagination = usePagination({
    initialLimit: 10,
    initialSort: "createdAt",
    initialOrder: "desc",
  });

  const fetchProducts = async () => {
    const params: Record<string, string | number> = {
      page: pagination.page,
      limit: pagination.limit,
      sortBy: pagination.sortBy,
      sortOrder: pagination.sortOrder,
    };

    if (pagination.search) params.search = pagination.search;
    if (category) params.category = category;

    await fetchWithPagination(params);
    pagination.setTotal(total);
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

  const handleDelete = async () => {
    if (!deleteConfirm.product) return;

    try {
      const { data } = await apiHandler.product.deleteProduct(
        deleteConfirm.product.id
      );
      if (data.success) {
        await fetchProducts();
        showSuccess("Product deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      showError("Failed to delete product");
    } finally {
      setDeleteConfirm({ show: false, product: null });
    }
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

  const renderProductRow = (product: Product) => (
    <tr key={product.id}>
      <td className="px-6 py-4">{product.title}</td>
      <td className="px-6 py-4">${product.price}</td>
      <td className="px-6 py-4">{product.category}</td>
      <td className="px-6 py-4">
        {new Date(product.createdAt).toLocaleString()}
      </td>
      <td className="px-6 py-4 space-x-2">
        {ACTIONS.map((action) => (
          <Link
            key={action.label}
            href={action.href(product.id)}
            className={action.className}
          >
            {action.label}
          </Link>
        ))}
        <button
          onClick={() => setDeleteConfirm({ show: true, product })}
          className="text-red-600 hover:text-red-900"
        >
          Delete
        </button>
      </td>
    </tr>
  );

  useEffect(() => {
    fetchProducts();
  }, [
    pagination.page,
    pagination.search,
    pagination.sortBy,
    pagination.sortOrder,
    category,
  ]);

  useEffect(() => {
    pagination.resetPage();
  }, [pagination.search, category]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold">Products Management</h1>
        <Link
          href="/admin/products/update"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm sm:text-base w-full sm:w-auto text-center"
        >
          Add Product
        </Link>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="border rounded px-3 py-2 text-sm sm:text-base"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded px-3 py-2 text-sm sm:text-base"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-4">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">No products found</div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{product.title}</h3>
                  <p className="text-gray-600 text-sm">{product.category}</p>
                </div>
                <span className="text-lg font-bold text-green-600">
                  ${product.price}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                {new Date(product.createdAt).toLocaleDateString()}
              </p>
              <div className="flex space-x-2">
                <Link
                  href={`/admin/products/${product.id}`}
                  className="flex-1 text-center bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700"
                >
                  View
                </Link>
                <Link
                  href={`/admin/products/update?id=${product.id}`}
                  className="flex-1 text-center bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700"
                >
                  Edit
                </Link>
                <button
                  onClick={() => setDeleteConfirm({ show: true, product })}
                  className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700"
                >
                  Delete
                </button>
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
                  <td colSpan={5} className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map(renderProductRow)
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        total={total}
        limit={pagination.limit}
        onPageChange={(page) => {
          pagination.setPage(page);
          fetchWithPagination({ ...pagination, page });
        }}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.show}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteConfirm.product?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ show: false, product: null })}
        type="danger"
      />
    </div>
  );
}
