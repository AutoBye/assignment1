import { Button } from "@/components/ui/button";

type CommentPaginationProps = {
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
};

export function CommentPagination({
  currentPage,
  totalPages,
  isLoading,
  onPageChange,
}: CommentPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPreviousPage || isLoading}
      >
        이전
      </Button>

      <span className="px-3 py-2 text-sm text-muted-foreground">
        {currentPage} / {totalPages}
      </span>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage || isLoading}
      >
        다음
      </Button>
    </div>
  );
}
