import { memo } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PostSearchBarProps = {
  query: string;
};

function PostSearchBar({ query }: PostSearchBarProps) {
  const hasQuery = query.trim().length > 0;

  return (
    <form action="/posts" method="GET" className="mb-4 flex gap-2">
      <Input
        name="q"
        defaultValue={query}
        placeholder="제목, 내용, 작성자로 검색"
      />

      <button type="submit" className={buttonVariants()}>
        검색
      </button>

      {hasQuery && (
        <Link href="/posts" className={buttonVariants({ variant: "outline" })}>
          초기화
        </Link>
      )}
    </form>
  );
}

export default memo(PostSearchBar);
