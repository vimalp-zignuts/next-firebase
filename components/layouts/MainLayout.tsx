import Navigation from "@/components/Navigation";
import Link from "next/link";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                ShopEase
              </h3>
              <p className="text-gray-600 text-sm">
                Your trusted online shopping destination with quality products
                and great prices.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="/products/list" className="hover:text-blue-600">
                    Products
                  </Link>
                </li>
                <li>
                  <Link href="/orders" className="hover:text-blue-600">
                    My Orders
                  </Link>
                </li>
                <li>
                  <Link href="/cart" className="hover:text-blue-600">
                    Cart
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="#" className="hover:text-blue-600">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-600">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-blue-600">
                    Returns
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-6">
            <p className="text-center text-sm text-gray-500">
              © 2024 ShopEase. Built with Next.js and Firebase.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
