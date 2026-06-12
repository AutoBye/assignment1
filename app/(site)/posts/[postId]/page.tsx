import { headers } from "next/headers";
import PostDetailClient from "@/components/post/PostDetailClient";
import { CurrentUserProvider } from "@/components/providers/CurrentUserProvider";
import { getCurrentUser } from "@/lib/auth";
import { getCommentsByPostId } from "@/lib/services/comment.service";
import { getPostDetail } from "@/lib/services/post-read.service";
import { recordPostView } from "@/lib/post-views";

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
    getCommentsByPostId(postId, 1, {
      notFoundBehavior: "empty",
    }),
  ]);

  return (
    <CurrentUserProvider currentUser={currentUser}>
      <PostDetailClient
        key={postId}
        initialPost={post}
        initialComments={commentsResult.comments}
        initialCommentPagination={commentsResult.pagination}
      />
    </CurrentUserProvider>
  );
}
