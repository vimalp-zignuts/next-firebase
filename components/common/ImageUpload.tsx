"use client";

import { useToast } from "@/contexts/ToastContext";
import Image from "next/image";
import { useRef, useState } from "react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onFileSelect: (file: File | null) => void;
  error?: string;
}

export default function ImageUpload({
  value,
  onChange,
  onFileSelect,
  error,
}: ImageUploadProps) {
  const { showError } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith("image/")) {
      return "Please select an image file";
    }
    if (file.size > 10 * 1024 * 1024) {
      return "Image size must be less than 10MB";
    }
    return null;
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const img = document.createElement("img");

      img.onload = () => {
        const maxWidth = 1200;
        const maxHeight = 1200;
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob!], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          0.8
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelection = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      showError(validationError);
      return;
    }

    try {
      const compressedFile = await compressImage(file);

      if (compressedFile.size > 1024 * 1024) {
        showError("Compressed image is still too large. Please use a smaller image.");
        return;
      }

      setSelectedFile(compressedFile);
      onFileSelect(compressedFile);

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Image processing error:', error);
      showError('Failed to process image');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelection(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelection(file);
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : error
            ? "border-red-300 bg-red-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {previewUrl || value ? (
          <div className="space-y-2">
            <Image
              height={500}
              width={500}
              src={previewUrl || value}
              alt="Preview"
              className="w-32 h-32 object-cover mx-auto rounded"
            />
            <p className="text-sm text-gray-600">Click or drag to replace</p>
          </div>
        ) : (
          <div className="text-gray-500">
            <svg
              className="w-12 h-12 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p>Click to select or drag and drop an image</p>
            <p className="text-xs">PNG, JPG, GIF up to 1MB (auto-compressed)</p>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
