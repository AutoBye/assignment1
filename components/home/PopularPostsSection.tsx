import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PopularPost = {
  id: string;
  title: string;
  author: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
};

type PopularPostsSectionProps = {
  posts: PopularPost[];
};

// 포스트 있을때랑 없을때 분리하자
export default function PopularPostsSection({
  posts,
}: PopularPostsSectionProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl">인기 게시글</CardTitle>
      </CardHeader>

      <CardContent>
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            아직 인기 게시글이 없습니다.
          </p>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <article key={post.id}>
                <Link
                  href={`/posts/${post.id}`}
                  className="interactive-card group block cursor-pointer focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                >
                  <h3 className="font-semibold transition-colors group-hover:text-primary">
                    {post.title}
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {post.author} · {post.createdAt}
                  </p>

                  <p className="mt-2 text-sm text-muted-foreground">
                    좋아요 {post.likeCount}개 · 댓글 {post.commentCount}개
                  </p>
                </Link>
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
