import PopularPostsSection from "@/components/home/PopularPostsSection";
import RecentPostsSection from "@/components/home/RecentPostsSection";
import { getCurrentUser } from "@/lib/auth";
import Header from "@/components/layout/Header";
import HeroSection from "@/components/home/HeroSection";
import Footer from "@/components/layout/Footer";

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
      <Header currentUser={currentUser} />

      <main className="mx-auto max-w-4xl p-4">
        <HeroSection />

        <PopularPostsSection posts={popularPosts} />

        <RecentPostsSection posts={recentPosts} />
      </main>

      <Footer />
    </div>
  );
}
