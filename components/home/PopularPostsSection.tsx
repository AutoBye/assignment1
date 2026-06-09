import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
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
              <article key={post.id} className="rounded-lg border p-4">
                <h3 className="font-semibold">{post.title}</h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  {post.author} · {post.createdAt}
                </p>

                <p className="mt-2 text-sm text-muted-foreground">
                  좋아요 {post.likeCount}개 · 댓글 {post.commentCount}개
                </p>

                <Link
                  href={`/posts/${post.id}`}
                  className={buttonVariants({
                    variant: "link",
                    size: "sm",
                  })}
                >
                  상세보기
                </Link>
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
