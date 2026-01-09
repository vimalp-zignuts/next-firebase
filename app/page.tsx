import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl text-white p-6 sm:p-8 lg:p-12 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
          Welcome to ShopEase
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 opacity-90">
          Discover amazing products at unbeatable prices
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={"/products/list"}
            className="bg-white text-blue-600 px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm text-center">
          <div className="text-3xl sm:text-4xl mb-4">🚚</div>
          <h3 className="text-lg sm:text-xl font-semibold mb-2">Fast Delivery</h3>
          <p className="text-gray-600 text-sm sm:text-base">
            Get your orders delivered quickly and safely
          </p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm text-center">
          <div className="text-3xl sm:text-4xl mb-4">💳</div>
          <h3 className="text-lg sm:text-xl font-semibold mb-2">Secure Payment</h3>
          <p className="text-gray-600 text-sm sm:text-base">Your transactions are safe and secure</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm text-center sm:col-span-2 lg:col-span-1">
          <div className="text-3xl sm:text-4xl mb-4">🔄</div>
          <h3 className="text-lg sm:text-xl font-semibold mb-2">Easy Returns</h3>
          <p className="text-gray-600 text-sm sm:text-base">Hassle-free returns within 30 days</p>
        </div>
      </section>
    </div>
  );
}
