"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navigation() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, loading, logout } = useAuth();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/");
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl sm:text-2xl font-bold text-blue-600">
              🛍️ ShopEase
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {loading ? (
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <>
                <Link
                  href="/products/list"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Products
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/orders"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                    >
                      My Orders
                    </Link>
                    {isAdmin ? (
                      <Link
                        href="/admin"
                        className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 text-sm font-medium rounded-md transition-colors"
                      >
                        Admin Panel
                      </Link>
                    ) : null}
                  </>
                ) : null}
              </>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
            ) : isAuthenticated ? (
              <>
                <Link
                  href="/cart"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
                >
                  🛒 Cart ({cartCount})
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button & Cart */}
          <div className="md:hidden flex items-center space-x-2">
            {isAuthenticated && (
              <Link
                href="/cart"
                className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
              >
                🛒 {cartCount}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {loading ? (
                <div className="w-full h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <>
                  <Link
                    href="/products/list"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Products
                  </Link>
                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/orders"
                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Orders
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="block px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="block px-3 py-2 text-base font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
