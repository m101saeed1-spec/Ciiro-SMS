import React from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages = 5,
  pageSize = 10,
  totalItems,
  onPageChange,
  onPageSizeChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-2 text-sm text-slate-500 dark:text-slate-400">
      <div className="text-xs sm:text-sm text-slate-400 dark:text-slate-500">
        Showing <span className="font-medium text-slate-700 dark:text-slate-200">{Math.min((currentPage - 1) * pageSize + 1, totalItems)}</span> to{' '}
        <span className="font-medium text-slate-700 dark:text-slate-200">{Math.min(currentPage * pageSize, totalItems)}</span> of{' '}
        <span className="font-medium text-slate-700 dark:text-slate-200">{totalItems}</span> entries
      </div>

      <div className="flex items-center gap-3">
        {/* Page navigation controls */}
        <div className="flex items-center gap-1">
          <button
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-1.5 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-slate-600 dark:text-slate-400 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {[1, 2, 3, 4, 5].slice(0, Math.max(1, Math.min(totalPages, 5))).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`min-w-[32px] h-8 px-2.5 rounded-lg text-xs font-semibold transition-all ${
                currentPage === page
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {page}
            </button>
          ))}

          {totalPages > 5 && <span className="px-1 text-slate-400 dark:text-slate-500">...</span>}
          {totalPages > 5 && (
            <button
              onClick={() => onPageChange(totalPages)}
              className={`min-w-[32px] h-8 px-2.5 rounded-lg text-xs font-semibold transition-all ${
                currentPage === totalPages
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {totalPages}
            </button>
          )}

          <button
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-1.5 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-slate-600 dark:text-slate-400 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Items per page selector */}
        {onPageSizeChange && (
          <div className="relative inline-block text-xs">
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 pl-3 pr-8 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              <option value={5}>5 / page</option>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}
      </div>
    </div>
  );
};
