"use client";

import { useProducts } from "@/contexts/ProductContext";
import ProductCard from "@/components/common/ProductCard";
import { useCallback, useRef } from "react";

interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
  createdAt: Date;
}

export default function ProductsPage() {
  const { products, loading, hasMore, loadMore } = useProducts();
  const observer = useRef<IntersectionObserver | null>(null);

  const lastProductRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, loadMore]
  );



  if (products.length === 0 && loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading products...
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold">All Products</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product, index) => (
          <div
            key={product.id}
            ref={index === products.length - 1 ? lastProductRef : null}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
}
