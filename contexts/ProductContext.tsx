"use client";

import { useToast } from "@/contexts/ToastContext";
import { apiHandler } from "@/lib/apiHandler";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
  createdAt: Date;
}

interface ProductContextType {
  products: Product[];
  loading: boolean;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
  total: number;
  refreshProducts: () => Promise<void>;
  loadMore: () => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  fetchWithPagination: (filters?: any) => Promise<void>;
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const { showError } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  const fetchProducts = async (pageNum = 1, append = false) => {
    setLoading(true);
    try {
      const filterString = `page=${pageNum}&limit=${limit}`;
      const { data } = await apiHandler.product.getProducts(filterString);
      if (data.success) {
        if (append) {
          setProducts((prev) => [...prev, ...data.data]);
        } else {
          setProducts(data.data);
        }
        setHasMore(data.data.length === limit);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      showError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchWithPagination = async (filters: any = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: filters.page?.toString() || currentPage.toString(),
        limit: filters.limit?.toString() || "10",
        ...filters,
      });

      const { data } = await apiHandler.product.getProducts(params.toString());
      if (data.success) {
        setProducts(data.data);
        setTotalPages(data.totalPages || 1);
        setTotal(data.count || 0);
        if (filters.page) setCurrentPage(filters.page);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      showError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!loading && hasMore) {
      await fetchProducts(page + 1, true);
    }
  };

  const setPageNum = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      fetchWithPagination({ page: pageNum });
    }
  };

  const nextPage = () => setPageNum(currentPage + 1);
  const prevPage = () => setPageNum(currentPage - 1);

  const getProductById = (id: string) => {
    return products.find((product) => product.id === id);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        hasMore,
        currentPage,
        totalPages,
        total,
        refreshProducts: () => fetchProducts(1, false),
        loadMore,
        getProductById,
        fetchWithPagination,
        setPage: setPageNum,
        nextPage,
        prevPage,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
}
