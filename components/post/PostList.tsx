import Link from "next/link";
import Pagination from "@/components/post/pagination";

type PostListItem = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: {
    name: string;
    email: string;
  };
  commentCount: number;
  likeCount: number;
  bookmarkCount: number;
};

type PostListProps = {
    posts: PostListItem[];
    currentPage: number;
    totalPages: number;
};

export default function PostList({ posts, currentPage, totalPages }: PostListProps) {
  if (posts.length === 0) {
    return (
      <section className="rounded border bg-white p-6">
        <h1 className="mb-4 text-2xl font-bold">게시글 목록</h1>

        <p className="mb-4 text-sm text-gray-500">
          아직 작성된 게시글이 없습니다.
        </p>

        <Link
          href="/posts/new"
          className="rounded bg-blue-500 px-4 py-2 text-white"
        >
          글쓰기
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded border bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">게시글 목록</h1>

        <Link
          href="/posts/new"
          className="rounded bg-blue-500 px-4 py-2 text-white"
        >
          글쓰기
        </Link>
      </div>

      <div className="space-y-3">
        {posts.map((post) => (
          <article key={post.id} className="rounded border p-4">
            <Link href={`/posts/${post.id}`}>
              <h2 className="font-bold hover:text-blue-500">{post.title}</h2>
            </Link>

            <p className="mt-2 line-clamp-2 text-sm text-gray-600">
              {post.content}
            </p>

            <div className="mt-3 text-sm text-gray-500">
              <p>
                작성자: {post.author.name} · 작성일: {post.createdAt}
              </p>

              <p>
                좋아요 {post.likeCount}개 · 댓글 {post.commentCount}개 · 북마크{" "}
                {post.bookmarkCount}개
              </p>
            </div>

            <Link
              href={`/posts/${post.id}`}
              className="mt-3 inline-block text-sm text-blue-500"
            >
              상세보기
            </Link>
          </article>
        ))}
      </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} />
    </section>
  );
}
