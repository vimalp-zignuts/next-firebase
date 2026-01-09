import { useState, useCallback } from 'react';

interface UsePaginationProps {
  initialPage?: number;
  initialLimit?: number;
  initialSearch?: string;
  initialSort?: string;
  initialOrder?: 'asc' | 'desc';
}

export function usePagination({
  initialPage = 1,
  initialLimit = 10,
  initialSearch = '',
  initialSort = 'createdAt',
  initialOrder = 'desc'
}: UsePaginationProps = {}) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState(initialSearch);
  const [sortBy, setSortBy] = useState(initialSort);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialOrder);
  const [total, setTotal] = useState(0);

  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder
    });
    
    if (search) params.set('search', search);
    
    return params;
  }, [page, limit, search, sortBy, sortOrder]);

  const resetPage = useCallback(() => setPage(1), []);
  
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    total,
    setTotal,
    totalPages,
    buildQueryParams,
    resetPage
  };
}