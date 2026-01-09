"use client";

import ImageUpload from "@/components/common/ImageUpload";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useFormValidation } from "@/hooks/useFormValidation";
import { apiHandler } from "@/lib/apiHandler";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface ProductFormData {
  title: string;
  price: string;
  description: string;
  category: string;
  imageUrl: string;
}

const validationRules = {
  title: { required: true, minLength: 2, maxLength: 100 },
  price: {
    required: true,
    custom: (value: string) => {
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) return "Price must be a positive number";
      return null;
    },
  },
  description: { required: true, minLength: 10, maxLength: 500 },
  category: { required: true },
  imageUrl: { required: false },
};

const initialFormData: ProductFormData = {
  title: "",
  price: "",
  description: "",
  category: "",
  imageUrl: "",
};

export default function AdminProductForm() {
  const { isAdmin, loading: authLoading } = useAuth();
  const { showError, showSuccess } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");
  const isEditing = !!productId;
  const [loading, setLoading] = useState(isEditing);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const {
    data,
    errors,
    isSubmitting,
    setIsSubmitting,
    updateField,
    validateAll,
    setFormData,
  } = useFormValidation(initialFormData, validationRules);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/");
      return;
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin && isEditing && productId) {
      fetchProduct();
    }
  }, [isAdmin, isEditing, productId]);

  const fetchProduct = async () => {
    if (!productId) return;
    try {
      const { data } = await apiHandler.product.getProductById(productId);

      if (data.success) {
        const product = data.data;
        setFormData({
          title: product.title,
          price: product.price.toString(),
          description: product.description,
          category: product.category,
          imageUrl: product.imageUrl || "",
        });
      } else {
        showError("Failed to load product");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      showError("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAll()) return;

    setIsSubmitting(true);
    try {
      let imageUrl = data.imageUrl;

      // Upload image if a new file was selected
      if (selectedImageFile) {
        const formData = new FormData();
        formData.append("file", selectedImageFile);

        const { data: uploadResult } = await apiHandler.utils.uploadImage(
          formData
        );

        if (uploadResult.success) {
          imageUrl = uploadResult.url;
        } else {
          showError(uploadResult.error || "Image upload failed");
          return;
        }
      }

      const obj = {
        ...data,
        price: parseFloat(data.price),
        imageUrl,
      };

      const { data: productRes } = isEditing
        ? await apiHandler.product.updateProduct(productId!, obj)
        : await apiHandler.product.createProduct(obj);

      if (productRes.success) {
        showSuccess(`Product ${isEditing ? 'updated' : 'created'} successfully`);
        if (isEditing) {
          router.push(`/admin/products/${productId}`);
        } else {
          router.push("/admin/products");
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
      showError(`Failed to ${isEditing ? "update" : "create"} product`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold">
          {isEditing ? "Edit Product" : "Create Product"}
        </h1>
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-800 text-sm sm:text-base"
        >
          Cancel
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Title *
            </label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => updateField("title", e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-sm sm:text-base ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter product title"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price *
            </label>
            <input
              type="number"
              step="0.01"
              value={data.price}
              onChange={(e) => updateField("price", e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-sm sm:text-base ${
                errors.price ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="0.00"
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={data.category}
              onChange={(e) => updateField("category", e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-sm sm:text-base ${
                errors.category ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Category</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="books">Books</option>
              <option value="home">Home & Garden</option>
              <option value="sports">Sports</option>
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={data.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={4}
              className={`w-full border rounded-lg px-3 py-2 text-sm sm:text-base ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter product description"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image
            </label>
            <ImageUpload
              value={data.imageUrl}
              onChange={(url) => updateField("imageUrl", url)}
              onFileSelect={setSelectedImageFile}
              error={errors.imageUrl}
            />
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base"
            >
              {isSubmitting
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                ? "Update Product"
                : "Create Product"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full sm:flex-1 bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 text-sm sm:text-base"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
