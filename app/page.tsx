import Link from "next/link";
import PopularPostsSection from "@/components/home/PopularPostsSection";
import RecentPostsSection from "@/components/home/RecentPostsSection";
import { getCurrentUser } from "@/lib/auth";

// 서버 컴포넌트임

const popularPosts = [
    {
        id: "1",
        title: "첫 번째 인기글입니다",
        author: "관리자",
        createdAt: "2026-06-04",
        likeCount: 12,
        commentCount: 3,
    },
    {
        id: "2",
        title: "게시판 프로젝트를 시작했습니다",
        author: "홍길동",
        createdAt: "2026-06-04",
        likeCount: 8,
        commentCount: 5,
    },
];

const recentPosts = [
    {
        id: "1",
        title: "첫 게시글 작성 예시",
        author: "관리자",
        createdAt: "2026-06-04",
    },
    {
        id: "2",
        title: "댓글 기능 테스트",
        author: "홍길동",
        createdAt: "2026-06-04",
    },
    {
        id: "3",
        title: "북마크 기능은 어떻게 만들까?",
        author: "김철수",
        createdAt: "2026-06-04",
    },
];

export default async function Home() {
    // 서버 컴포넌트라서 서버에서 쿠키를 읽고 DB 조회 가능
    const currentUser = await getCurrentUser();

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="border-b bg-white">
                <div className="mx-auto flex max-w-4xl items-center justify-between p-4">
                    <Link href="/" className="text-xl font-bold">
                        과제용 웹 페이지
                    </Link>

                    <nav className="flex gap-4">
                        <Link href="/posts">게시글</Link>

                        {currentUser ? (
                            <>
                                <span>{currentUser.name}님</span>

                                <form action="/api/auth/logout" method="post">
                                    <button type="submit">로그아웃</button>
                                </form>
                            </>
                        ) : (
                            <>
                                <Link href="/login">로그인</Link>
                                <Link href="/register">회원가입</Link>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            <main className="mx-auto max-w-4xl p-4">
                <section className="mb-6 rounded border bg-white p-6">
                    <h1 className="mb-2 text-2xl font-bold">게시판 프로젝트</h1>

                    <p className="mb-4 text-gray-600">
                        게시글, 댓글, 좋아요, 북마크 기능을 연습하는 과제용 웹
                        페이지입니다.
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

                <PopularPostsSection posts={popularPosts} />

                <RecentPostsSection posts={recentPosts} />
            </main>

            <footer className="border-t bg-white p-4 text-center text-sm text-gray-500">
                © 2026 Assignment Board Project
            </footer>
        </div>
    );
}