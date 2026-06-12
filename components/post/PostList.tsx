import Link from "next/link";
import Pagination from "@/components/post/pagination";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PostListItem } from "@/types/post";
import { Input } from "@/components/ui/input";

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
  const hasQuery = query.trim().length > 0;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-2xl">게시글 목록</CardTitle>

          <CardDescription>
            {hasQuery
              ? `"${query}" 검색 결과 ${totalPostCount}개`
              : `전체 게시글 ${totalPostCount}개`}
          </CardDescription>
        </div>

        <Link href="/posts/new" className={buttonVariants()}>
          글쓰기
        </Link>
      </CardHeader>

      <CardContent>
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
            <Link
              href="/posts"
              className={buttonVariants({ variant: "outline" })}
            >
              초기화
            </Link>
          )}
        </form>

        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {hasQuery
              ? "검색 결과가 없습니다."
              : "아직 작성된 게시글이 없습니다."}
          </p>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <article key={post.id}>
                <Link
                  href={`/posts/${post.id}`}
                  className="interactive-card group block cursor-pointer focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                >
                  <h2 className="font-semibold transition-colors group-hover:text-primary">
                    {post.title}
                  </h2>

                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {post.content}
                  </p>

                  <div className="mt-3 text-sm text-muted-foreground">
                    <p>
                      작성자 {post.author.name} · 작성일 {post.createdAt}
                    </p>

                    <p>
                      조회수 {post.viewCount}개 · 좋아요 {post.likeCount}개 ·
                      댓글 {post.commentCount}개 · 북마크 {post.bookmarkCount}개
                    </p>
                  </div>
                </Link>
              </article>
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
