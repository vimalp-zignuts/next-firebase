"use client";

import { useToast } from "@/contexts/ToastContext";
import { apiHandler } from "@/lib/apiHandler";
import ProductCard from "@/components/common/ProductCard";
import Link from "next/link";
import { useParams } from "next/navigation";
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

export default function ProductDetail() {
  const params = useParams();
  const { showError } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await apiHandler.product.getProductById(params.id as string);

        if (data.success) {
          setProduct(data.data);
        } else {
          setError("Product not found");
          showError("Product not found");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("Failed to load product");
        showError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id, showError]);



  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="mb-4">{error}</p>
        <Link
          href="/products/list"
          className="text-blue-600 hover:text-blue-800"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/products/list"
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Products
        </Link>
      </div>

      <div className="max-w-md mx-auto">
        <ProductCard product={product} showDescription={false} />
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
        <h3 className="text-lg font-semibold mb-4">Description</h3>
        <p className="text-gray-700 leading-relaxed mb-6">
          {product.description}
        </p>
        
        <div className="text-sm text-gray-500">
          <p>Product ID: {product.id}</p>
          <p>Added: {new Date(product.createdAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
