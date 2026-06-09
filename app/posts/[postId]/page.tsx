import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PostDetailClient from "@/components/post/PostDetailClient";
import { getCurrentUser } from "@/lib/auth";
import { getCommentsByPostId } from "@/lib/comments";
import { getPostDetail } from "@/lib/posts";

type PostDetailPageProps = {
  params: Promise<{
    postId: string;
  }>;
};

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const currentUser = await getCurrentUser();
  const { postId } = await params;

  const [post, commentsResult] = await Promise.all([
      getPostDetail(postId, currentUser?.id),
      getCommentsByPostId(postId, 1),
  ]);

  return (
      <div className="min-h-screen bg-muted/40">
          <Header currentUser={currentUser} />

          <main className="mx-auto max-w-4xl p-4">
              <PostDetailClient
                  key={postId}
                  postId={postId}
                  currentUser={currentUser}
                  initialPost={post}
                  initialComments={commentsResult.comments}
                  initialCommentPagination={commentsResult.pagination}
              />
          </main>

          <Footer />
      </div>
  );
}
