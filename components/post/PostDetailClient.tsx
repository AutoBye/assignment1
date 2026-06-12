"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { CommentPaginationResponse } from "@/types/api";
import type { CommentItem } from "@/types/comment";
import type { PostDetail } from "@/types/post";
import { getErrorMessage } from "@/lib/api/client";
import { deletePostRequest } from "@/lib/requests/createPostRequest";
import CommentSection from "@/components/comments/CommentSection";
import PostDetailActions from "@/components/post/detail/PostDetailActions";
import PostDetailMeta from "@/components/post/detail/PostDetailMeta";
import PostNotFoundCard from "@/components/post/detail/PostNotFoundCard";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConfirmModalStore } from "@/lib/stores/confirm-modal-store";
import { useErrorModalStore } from "@/lib/stores/error-modal-store";
import { useToastStore } from "@/lib/stores/toast-store";

type PostDetailClientProps = {
  initialPost: PostDetail | null;
  initialComments: CommentItem[];
  initialCommentPagination: CommentPaginationResponse;
};

type PostDetailState = {
  post: PostDetail | null;
  message: string;
  isDeleting: boolean;
};

export default function PostDetailClient({
  initialPost,
  initialComments,
  initialCommentPagination,
}: PostDetailClientProps) {
  const router = useRouter();
  const { currentUser } = useCurrentUser();

  const openConfirmModal = useConfirmModalStore(
    (state) => state.openConfirmModal,
  );
  const openErrorModal = useErrorModalStore((state) => state.openErrorModal);
  const showToast = useToastStore((state) => state.showToast);

  const [detailState, setDetailState] = useState<PostDetailState>({
    post: initialPost,
    message: "",
    isDeleting: false,
  });

  const { post, message, isDeleting } = detailState;

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleDeletePost = useCallback(async () => {
    if (!post) {
      return;
    }

    const confirmed = await openConfirmModal({
      title: "게시글 삭제",
      message: "게시글을 삭제하시겠습니까?",
      confirmText: "삭제",
      cancelText: "취소",
    });

    if (!confirmed) {
      return;
    }

    setDetailState((currentState) => ({
      ...currentState,
      message: "",
      isDeleting: true,
    }));

    try {
      const data = await deletePostRequest(post.id);

      showToast({
        type: "success",
        message: data.message,
      });

      router.replace("/posts");
      router.refresh();
    } catch (error) {
      openErrorModal(
        getErrorMessage(error, "게시글 삭제 요청 중 오류가 발생했습니다."),
      );
    } finally {
      setDetailState((currentState) => ({
        ...currentState,
        isDeleting: false,
      }));
    }
  }, [openConfirmModal, openErrorModal, post, router, showToast]);

  const handleCommentCountChange = useCallback((amount: number) => {
    setDetailState((currentState) => {
      if (!currentState.post) {
        return currentState;
      }

      return {
        ...currentState,
        post: {
          ...currentState.post,
          commentCount: Math.max(0, currentState.post.commentCount + amount),
        },
      };
    });
  }, []);

  const handleLikeChange = useCallback((likeCount: number, liked: boolean) => {
    setDetailState((currentState) => {
      if (!currentState.post) {
        return currentState;
      }

      return {
        ...currentState,
        post: {
          ...currentState.post,
          likeCount,
          likedByCurrentUser: liked,
        },
      };
    });
  }, []);

  const handleBookmarkChange = useCallback(
    (bookmarkCount: number, bookmarked: boolean) => {
      setDetailState((currentState) => {
        if (!currentState.post) {
          return currentState;
        }

        return {
          ...currentState,
          post: {
            ...currentState.post,
            bookmarkCount,
            bookmarkedByCurrentUser: bookmarked,
          },
        };
      });
    },
    [],
  );

  if (!post) {
    return <PostNotFoundCard onBack={handleBack} />;
  }

  const isAuthor = currentUser?.id === post.author.id;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-2xl">{post.title}</CardTitle>

        <Link
          href="/"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          메인으로
        </Link>
      </CardHeader>

      <CardContent>
        {message && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <PostDetailMeta post={post} />

        <div className="min-h-60 whitespace-pre-wrap text-sm leading-7">
          {post.content}
        </div>

        <PostDetailActions
          postId={post.id}
          isAuthor={isAuthor}
          isDeleting={isDeleting}
          liked={post.likedByCurrentUser}
          likeCount={post.likeCount}
          bookmarked={post.bookmarkedByCurrentUser}
          bookmarkCount={post.bookmarkCount}
          onBack={handleBack}
          onDelete={handleDeletePost}
          onLikeChange={handleLikeChange}
          onBookmarkChange={handleBookmarkChange}
        />

        <CommentSection
          postId={post.id}
          initialComments={initialComments}
          initialPagination={initialCommentPagination}
          onCommentCountChange={handleCommentCountChange}
        />
      </CardContent>
    </Card>
  );
}
