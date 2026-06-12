import { headers } from "next/headers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PostDetailClient from "@/components/post/PostDetailClient";
import { getCurrentUser } from "@/lib/auth";
import { getPostDetail } from "@/lib/posts";
import { CurrentUserProvider } from "@/components/providers/CurrentUserProvider";
import { recordPostView } from "@/lib/post-views";
import {getCommentsByPostId} from "@/lib/services/comment.service";

type PostDetailPageProps = {
  params: Promise<{
    postId: string;
  }>;
};

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const currentUser = await getCurrentUser();
  const { postId } = await params;
  const requestHeader = await headers();

  await recordPostView({
    currentUserId: currentUser?.id,
    headers: requestHeader,
    postId,
  });

  const [post, commentsResult] = await Promise.all([
    getPostDetail(postId, currentUser?.id),
    getCommentsByPostId(postId, 1),
  ]);

  return (
    <div className="min-h-screen bg-muted/40">
      <Header />
      <main className="mx-auto max-w-4xl p-4">
        <CurrentUserProvider currentUser={currentUser}>
          <PostDetailClient
            key={postId}
            initialPost={post}
            initialComments={commentsResult.comments}
            initialCommentPagination={commentsResult.pagination}
          />
        </CurrentUserProvider>
      </main>
      <Footer />
    </div>
  );
}
