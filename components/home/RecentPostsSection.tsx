import Link from "next/link";

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
      <section className="mb-6 rounded border bg-white p-6">
        <h2 className="mb-4 text-xl font-bold">최근 게시글</h2>

        <div className="space-y-3">
          {posts.map((post) => (
              <article key={post.id} className="rounded border bg-white p-4">
                <h3 className="font-bold">{post.title}</h3>

                <p className="mt-1 text-sm text-gray-600">
                  {post.author} · {post.createdAt}
                </p>

                <Link
                    href={`/posts/${post.id}`}
                    className="mt-2 inline-block text-sm text-blue-500"
                >
                  상세보기
                </Link>
              </article>
          ))}
        </div>
      </section>
  );
}