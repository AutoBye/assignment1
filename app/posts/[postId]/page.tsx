import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PostDetailClient from "@/components/post/PostDetailClient";
import { getCurrentUser } from "@/lib/auth";

type PostDetailPageProps = {
  params: Promise<{
    postId: string;
  }>;
};

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const currentUser = await getCurrentUser();
  const { postId } = await params;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header currentUser={currentUser} />

      <main className="mx-auto max-w-4xl p-4">
        <PostDetailClient
            key={postId}
            postId={postId}
            currentUser={currentUser}
        />
      </main>

      <Footer />
    </div>
  );
}
