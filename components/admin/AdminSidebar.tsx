"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/products", label: "Products", icon: "📦" },
  { href: "/admin/orders", label: "Orders", icon: "📋" },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed z-50 left-0 top-0 w-64 h-full bg-white shadow-lg border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Admin Panel</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">E-Commerce Management</p>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <nav className="mt-6">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center px-4 sm:px-6 py-3 text-sm transition-all duration-200 ${
                isActive(item.href)
                  ? "bg-blue-50 text-blue-700 border-r-3 border-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6">
          <Link
            href="/"
            className="flex items-center text-sm text-gray-400 hover:text-blue-600 transition-colors"
            onClick={onClose}
          >
            <span className="mr-2">←</span>
            Back to Store
          </Link>
        </div>
      </div>
    </>
  );
}
