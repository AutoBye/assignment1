import Link from "next/link";

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

export default function PopularPostsSection({
                                              posts,
                                            }: PopularPostsSectionProps) {
  return (
      <section className="mb-6 rounded border bg-white p-6">
        <h2 className="mb-4 text-xl font-bold">인기 게시글</h2>

        <div className="space-y-3">
          {posts.map((post) => (
              <article key={post.id} className="rounded border p-4">
                <h3 className="font-bold">{post.title}</h3>

                <p className="mt-1 text-sm text-gray-600">
                  {post.author} · {post.createdAt}
                </p>

                <p className="mt-2 text-sm text-gray-600">
                  좋아요 {post.likeCount}개 · 댓글 {post.commentCount}개
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