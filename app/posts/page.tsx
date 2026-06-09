import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PostList from "@/components/post/PostList";
import { getCurrentUser } from "@/lib/auth";
import { getPositivePageNumber } from "@/lib/validators";
import { getPosts } from "@/lib/posts";

type PostsPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

//06-09 getPosts() 다른곳으로 날림
export default async function PostsPage({ searchParams }: PostsPageProps) {
  const currentUser = await getCurrentUser();
  const { page } = await searchParams;
  const requestedPage = getPositivePageNumber(page);

  const { posts, currentPage, totalPages } = await getPosts(requestedPage);

  return (
    <div className="min-h-screen bg-muted/40">
      <Header currentUser={currentUser} />

      <main className="mx-auto max-w-4xl p-4">
        <PostList
          posts={posts}
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </main>

      <Footer />
    </div>
  );
}
