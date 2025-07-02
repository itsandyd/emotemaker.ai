import { useRouter } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface EmotePaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  extraParams?: string;
}

const EmotePagination = ({ 
  currentPage,
  totalPages,
  baseUrl,
  extraParams = ""
}: EmotePaginationProps) => {
  const router = useRouter();

  // Create an array of page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first and last page
      // Show current page and pages around it
      const leftSideCount = Math.min(Math.floor(maxVisiblePages / 2), currentPage - 1);
      const rightSideCount = Math.min(Math.floor(maxVisiblePages / 2), totalPages - currentPage);
      
      const startPage = Math.max(1, currentPage - leftSideCount);
      const endPage = Math.min(totalPages, currentPage + rightSideCount);
      
      if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) pageNumbers.push(-1); // -1 represents ellipsis
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pageNumbers.push(-1); // -1 represents ellipsis
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const params = extraParams ? `&${extraParams.replace(/^&/, '')}` : '';
    router.push(`${baseUrl}?page=${page}${params}`);
  };

  return (
    <Pagination className="mt-8">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) handlePageChange(currentPage - 1);
            }}
            className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
          />
        </PaginationItem>
        
        {getPageNumbers().map((pageNum, idx) => {
          if (pageNum === -1) {
            // Render ellipsis
            return (
              <PaginationItem key={`ellipsis-${idx}`}>
                <span className="px-4">...</span>
              </PaginationItem>
            );
          }
          
          return (
            <PaginationItem key={pageNum}>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(pageNum);
                }}
                isActive={currentPage === pageNum}
              >
                {pageNum}
              </PaginationLink>
            </PaginationItem>
          );
        })}
        
        <PaginationItem>
          <PaginationNext 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) handlePageChange(currentPage + 1);
            }}
            className={cn(currentPage === totalPages && "pointer-events-none opacity-50")}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default EmotePagination; 