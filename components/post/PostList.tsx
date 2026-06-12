import Link from "next/link";
import Pagination from "@/components/post/pagination";
import PostListEmpty from "@/components/post/list/PostListEmpty";
import PostListItemCard from "@/components/post/list/PostListItemCard";
import PostSearchBar from "@/components/post/list/PostSearchBar";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PostListItem } from "@/types/post";

type PostListProps = {
  posts: PostListItem[];
  currentPage: number;
  totalPages: number;
  totalPostCount: number;
  query: string;
};

export default function PostList({
  posts,
  currentPage,
  totalPages,
  totalPostCount,
  query,
}: PostListProps) {
  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length > 0;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-2xl">게시글 목록</CardTitle>

          <CardDescription>
            {hasQuery
              ? `"${trimmedQuery}" 검색 결과 ${totalPostCount}개`
              : `전체 게시글 ${totalPostCount}개`}
          </CardDescription>
        </div>

        <Link href="/posts/new" className={buttonVariants()}>
          글쓰기
        </Link>
      </CardHeader>

      <CardContent>
        <PostSearchBar query={query} />

        {posts.length === 0 ? (
          <PostListEmpty hasQuery={hasQuery} />
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <PostListItemCard key={post.id} post={post} />
            ))}
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          query={query}
        />
      </CardContent>
    </Card>
  );
}
