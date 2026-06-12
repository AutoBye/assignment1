"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "@/lib/date";
import { queryKeys } from "@/lib/query-keys";
import { fetchBookmarkedPosts } from "@/lib/queries/me-query";

export default function BookmarkedPosts() {
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.me.bookmarks,
    queryFn: fetchBookmarkedPosts,
  });

  const posts = data?.posts ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>북마크한 게시글</CardTitle>
      </CardHeader>

      <CardContent>
        {isLoading && (
          <p className="text-sm text-muted-foreground">불러오는 중...</p>
        )}

        {isError && (
          <p className="text-sm text-destructive">
            북마크 목록을 가져오지 못했습니다.
          </p>
        )}

        {!isLoading && !isError && posts.length === 0 && (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>북마크한 게시글이 없습니다.</p>

            <Link
              href="/posts"
              className="text-primary underline-offset-4 hover:underline"
            >
              게시글 보러가기
            </Link>
          </div>
        )}

        {!isLoading && !isError && posts.length > 0 && (
          <div className="space-y-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="block rounded-md border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="space-y-1">
                  <h3 className="font-medium leading-none">{post.title}</h3>

                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {post.content}
                  </p>

                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>{post.author.name}</span>
                    <span>조회 {post.viewCount}</span>
                    <span>좋아요 {post.likeCount}</span>
                    <span>댓글 {post.commentCount}</span>
                    <span>북마크 {post.bookmarkCount}</span>
                    <span>저장일 {formatDate(post.bookmarkedAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
