import PopularPostsSection from "@/components/home/PopularPostsSection";
import RecentPostsSection from "@/components/home/RecentPostsSection";
import { getCurrentUser } from "@/lib/auth";
import Header from "@/components/layout/Header";
import HeroSection from "@/components/home/HeroSection";
import Footer from "@/components/layout/Footer";
import {prisma} from "@/lib/prisma";

// 서버 컴포넌트임
/** @description 날짜 포맷 함수
 *  @param date createdAt
 *  <br> RecentPostsSection과 PopularPostsSection은 문자열로 받음
 *  <br> 서버에서 문자열로 미리 바꿈
 * */
function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year} - ${month} - ${day}`;
}

/** DB에서 인기 게시글 가져오기
 * <br> 좋아요 수가 많은 게시글 우선
 * <br> 종아요 수 같으면 댓글 수 많은 게시글 우선
 * <br> 그것도 같으면 최신 순
 * <br> 최대 3개만
 * */
async function getPopularPosts() {
  const posts = await prisma.post.findMany({
    take: 3,
    orderBy: [
      {
        likes: {
          _count: "desc",
        },
      },
      {
        comments: {
          _count: "desc",
        },
      },
      {
        createdAt: "desc",
      },
    ],
    select: {
      id: true,
      title: true,
      createdAt: true,
      author: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  return posts.map((post) => ({
    id: post.id,
    title: post.title,
    author: post.author.name,
    createdAt: formatDate(post.createdAt),
    likeCount: post._count.likes,
    commentCount: post._count.comments,
  }));
}

/** DB에서 최근 게시글 가져오기
 * <br> posts 테이블에서 게시글 가져옴
 * <br> 최신순 정렬
 * <br> 최대 5개만
 * <br> 작성자 이름 <- 수정할까말까
 * */
async function getRecentPosts() {
  const posts = await prisma.post.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
      author: {
        select: {
          name: true,
        },
      },
    },
  });

  return posts.map((post) => ({
    id: post.id,
    title: post.title,
    author: post.author.name,
    createdAt: formatDate(post.createdAt),
  }));
}

export default async function Home() {
  // 서버 컴포넌트라서 서버에서 쿠키를 읽고 DB 조회 가능
  const currentUser = await getCurrentUser();

  const popularPosts = await getPopularPosts();
  const recentPosts = await getRecentPosts();

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
