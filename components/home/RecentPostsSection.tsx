import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RecentPost = {
  id: string;
  title: string;
  author: string;
  createdAt: string;
};

type RecentPostsSectionProps = {
  posts: RecentPost[];
};

export default function RecentPostsSection({ posts }: RecentPostsSectionProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl">최근 게시글</CardTitle>
      </CardHeader>

      <CardContent>
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            아직 작성된 게시글이 없습니다.
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
                </Link>
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
