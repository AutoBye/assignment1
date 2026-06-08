import Link from "next/link";

type PaginationProps = {
	currentPage: number;
	totalPages: number;
};

function createPageHref(page: number) {
	return `/posts?page=${page}`;
}

export default function Pagination ({
	currentPage,
	totalPages,
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
					href={createPageHref(currentPage - 1)}
					className="rounded border px-3 py-2 text-sm"
				>
					이전
				</Link>
			) : (
				<span className="rounded border px-3 py-2 text-sm text-gray-400">
					이전
				</span>
			)}

			<span className="px-3 py-2 text-sm">
				{currentPage} / {totalPages}
			</span>

			{hasNextPage ? (
				<Link
					href={createPageHref(currentPage + 1)}
					className="rounded border px-3 py-2 text-sm"
				>
					다음
				</Link>
			) : (
				<span className="rounded border px-3 py-2 text-sm text-gray-400">
					다음
				</span>
			)}
		</nav>
	);
}