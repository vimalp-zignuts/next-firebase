"use client";

import { useProducts } from "@/contexts/ProductContext";
import { apiHandler } from "@/lib/apiHandler";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
  });
  const { total: totalProducts } = useProducts();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [{ data: ordersRes }] = await Promise.all([
          apiHandler.order.getOrders("limit=1"),
        ]);

        setStats({
          totalOrders: ordersRes?.count || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/admin/products"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2">Products Management</h3>
          <p className="text-3xl font-bold text-blue-600 mb-2">
            {totalProducts}
          </p>
          <p className="text-gray-600">Total Products</p>
        </Link>

        <Link
          href="/admin/orders"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2">Orders Management</h3>
          <p className="text-3xl font-bold text-green-600 mb-2">
            {stats.totalOrders}
          </p>
          <p className="text-gray-600">Total Orders</p>
        </Link>
      </div>
    </div>
  );
}
