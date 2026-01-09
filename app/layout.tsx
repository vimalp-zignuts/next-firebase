import MainLayout from "@/components/layouts/MainLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ProductProvider } from "@/contexts/ProductContext";
import { ToastProvider } from "@/contexts/ToastContext";
import React from "react";
import "./globals.css";

export const metadata = {
  title: "ShopEase - Modern E-Commerce",
  description: "Modern e-commerce platform built with Next.js and Firebase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <ToastProvider>
          <AuthProvider>
            <ProductProvider>
              <CartProvider>
                <MainLayout>{children}</MainLayout>
              </CartProvider>
            </ProductProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
