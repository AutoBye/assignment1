//메인 소개 영역
import Link from "next/link";

export default function BoardIntroSection() {
  return (
    <section className="mb-6 rounded border bg-white p-6">
      <h1 className="mb-2 text-2xl font-bold">게시판 프로젝트</h1>

      <p className="mb-4 text-gray-600">
        게시글, 댓글, 좋아요, 북마크 기능을 연습하는 과제용 웹 페이지입니다.
      </p>

      <div className="flex gap-2">
        <Link
          href="/posts"
          className="rounded bg-blue-500 px-4 py-2 text-white"
        >
          게시글 보기
        </Link>

        <Link href="/posts/new" className="rounded border px-4 py-2">
          글쓰기
        </Link>
      </div>
    </section>
  );
}
