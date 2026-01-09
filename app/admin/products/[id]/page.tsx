"use client";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useAuth } from "@/contexts/AuthContext";
import { apiHandler } from "@/lib/apiHandler";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
  createdAt: Date;
}

export default function AdminProductDetail() {
  const { isAdmin, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/");
      return;
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin && params.id) {
      fetchProduct();
    }
  }, [isAdmin, params.id]);

  const fetchProduct = async () => {
    try {
      const { data } = await apiHandler.product.getProductById(
        params.id as string
      );
      if (data.success) {
        setProduct(data.data);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { data } = await apiHandler.product.deleteProduct(
        params.id as string
      );

      if (data.success) {
        router.push("/admin/products");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  if (!isAdmin) return null;

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <Link
          href="/admin/products"
          className="text-blue-600 hover:text-blue-800"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <Link
          href="/admin/products"
          className="text-blue-600 hover:text-blue-800 text-sm sm:text-base"
        >
          ← Back to Products
        </Link>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <Link
            href={`/admin/products/update?id=${product.id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center text-sm sm:text-base"
          >
            Edit
          </Link>
          <button
            onClick={() => setDeleteConfirm(true)}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm sm:text-base"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <div className="w-full lg:w-1/2">
            {product.imageUrl ? (
              <Image
                height={500}
                width={500}
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-64 sm:h-80 lg:h-96 object-cover"
              />
            ) : (
              <div className="w-full h-64 sm:h-80 lg:h-96 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No Image</span>
              </div>
            )}
          </div>

          <div className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-8">
            <div className="mb-4">
              <span className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                {product.category}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold mb-4">
              {product.title}
            </h1>

            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-6">
              ${product.price.toFixed(2)}
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                {product.description}
              </p>
            </div>

            <div className="text-sm text-gray-500 space-y-1">
              <p>
                <strong>Product ID:</strong> {product.id}
              </p>
              <p>
                <strong>Created:</strong>{" "}
                {new Date(product.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete "${product.title}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(false)}
        type="danger"
      />
    </div>
  );
}
