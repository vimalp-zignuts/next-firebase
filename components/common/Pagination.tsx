interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  total,
  limit,
  onPageChange
}: PaginationProps) {
  const startItem = ((currentPage - 1) * limit) + 1;
  const endItem = Math.min(currentPage * limit, total);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
      <div className="text-xs sm:text-sm text-gray-700 order-2 sm:order-1">
        Showing {startItem} to {endItem} of {total} results
      </div>
      <div className="flex items-center space-x-1 sm:space-x-2 order-1 sm:order-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 sm:px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-xs sm:text-sm"
        >
          Prev
        </button>
        
        <div className="flex space-x-1">
          {Array.from({ length: Math.min(totalPages <= 3 ? totalPages : 3, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 3) {
              pageNum = i + 1;
            } else if (currentPage <= 2) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 1) {
              pageNum = totalPages - 2 + i;
            } else {
              pageNum = currentPage - 1 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-2 sm:px-3 py-1 border rounded text-xs sm:text-sm ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2 sm:px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-xs sm:text-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
}