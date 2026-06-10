import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  query: string;
};

// 06-10 쿼리 추가.
function createPageHref(page: number, query?: string) {
  const params = new URLSearchParams({
    page: String(page),
  });

  const keyword = query?.trim();

  if (keyword) {
    params.set("q", keyword);
  }

  return `/posts?${params.toString()}`;
}

export default function Pagination({
  currentPage,
  totalPages,
  query,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  return (
    <nav className="mt-6 flex items-center justify-center gap-2">
      {hasPreviousPage ? (
        <Link
          href={createPageHref(currentPage - 1, query)}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          이전
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className: "cursor-not-allowed opacity-50",
          })}
        >
          이전
        </span>
      )}

      <span className="px-3 py-2 text-sm text-muted-foreground">
        {currentPage} / {totalPages}
      </span>

      {hasNextPage ? (
        <Link
          href={createPageHref(currentPage + 1, query)}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          다음
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className: "cursor-not-allowed opacity-50",
          })}
        >
          다음
        </span>
      )}
    </nav>
  );
}
