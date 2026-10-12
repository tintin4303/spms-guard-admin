interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const displayTotal = totalPages < 1 ? 1 : totalPages;
  return (
    <div className="px-6 py-3 border-t border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
      <span className="text-[13px] text-gray-500">Page {currentPage} of {displayTotal}</span>
      <div className="flex gap-2">
        <button 
          type="button" 
          disabled={currentPage === 1} 
          onClick={() => onPageChange(currentPage - 1)} 
          className="px-3 py-1 border rounded text-[13px] disabled:opacity-50 bg-white hover:bg-gray-50 transition-colors text-gray-700"
        >
          Previous
        </button>
        <button 
          type="button" 
          disabled={currentPage >= displayTotal} 
          onClick={() => onPageChange(currentPage + 1)} 
          className="px-3 py-1 border rounded text-[13px] disabled:opacity-50 bg-white hover:bg-gray-50 transition-colors text-gray-700"
        >
          Next
        </button>
      </div>
    </div>
  );
}
