"use client";

import { ProductInterface } from "@/types/DataInterfaces";
import Image from "next/image";

interface ProductDetailProps {
  product: ProductInterface;
  showFullDescription?: boolean;
  className?: string;
}

export default function ProductDetail({ 
  product, 
  showFullDescription = true, 
  className = "" 
}: ProductDetailProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {product.imageUrl ? (
        <Image
          height={400}
          width={400}
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-64 object-cover"
        />
      ) : (
        <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">No Image</span>
        </div>
      )}
      
      <div className="p-4">
        <div className="mb-2">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {product.category}
          </span>
        </div>
        
        <h2 className="text-xl font-semibold mb-2">{product.title}</h2>
        
        <p className={`text-gray-600 mb-3 ${!showFullDescription ? 'line-clamp-2' : ''}`}>
          {product.description}
        </p>
        
        <div className="text-2xl font-bold text-green-600">
          ${product.price.toFixed(2)}
        </div>
      </div>
    </div>
  );
}