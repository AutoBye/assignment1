import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BoardIntroSection from "@/components/home/BoardIntroSection";
import PopularPostsSection from "@/components/home/PopularPostsSection";
import RecentPostsSection from "@/components/home/RecentPostsSection";
import { getCurrentUser } from "@/lib/auth";
import { getPopularPosts, getRecentPosts } from "@/lib/posts";

// 서버 컴포넌트임
export default async function Home() {
  // 서버 컴포넌트라서 서버에서 쿠키를 읽고 DB 조회 가능
  // 06-09 post 관련 너무 길어서 그냥 lib 쪽에 빼버림
  // 언젠간 다른곳에서 재활용 하겠지
  const currentUser = await getCurrentUser();
  const popularPosts = await getPopularPosts();
  const recentPosts = await getRecentPosts();

  return (
    <div className="min-h-screen bg-muted/40">
      <Header currentUser={currentUser} />
      <main className="mx-auto max-w-4xl p-4">
        <BoardIntroSection />
        <PopularPostsSection posts={popularPosts} />
        <RecentPostsSection posts={recentPosts} />
      </main>
      <Footer />
    </div>
  );
}
