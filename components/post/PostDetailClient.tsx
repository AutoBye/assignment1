"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CommentPaginationResponse } from "@/types/api";
import type { CommentItem } from "@/types/comment";
import type { PostDetail } from "@/types/post";
import { getErrorMessage } from "@/lib/api/client";
import { deletePostRequest } from "@/lib/requests/createPostRequest";
import { formatDate } from "@/lib/date";
import CommentSection from "@/components/comments/CommentSection";
import BookmarkButton from "@/components/post/BookmarkButton";
import LikeButton from "@/components/post/LikeButton";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  async function handleDeletePost() {
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
  }

  function handleCommentCountChange(amount: number) {
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
  }

  function handleLikeChange(likeCount: number, liked: boolean) {
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
  }

  function handleBookmarkChange(bookmarkCount: number, bookmarked: boolean) {
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
  }

  if (!post) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">게시글 조회 실패</CardTitle>
          <CardDescription>
            게시글을 찾을 수 없거나 올바르지 않은 게시글 ID입니다.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              이전으로
            </Button>

            <Link href="/posts" className={buttonVariants()}>
              목록으로
            </Link>
          </div>
        </CardContent>
      </Card>
    );
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

        <div className="mb-6 border-b pb-4 text-sm text-muted-foreground">
          <p>작성자 {post.author.name}</p>
          <p>작성일 {formatDate(post.createdAt)}</p>
          <p>수정일 {formatDate(post.updatedAt)}</p>
          <p>
            조회수 {post.viewCount} · 좋아요 {post.likeCount}개 · 댓글{" "}
            {post.commentCount}개 · 북마크 {post.bookmarkCount}개
          </p>
        </div>

        <div className="min-h-60 whitespace-pre-wrap text-sm leading-7">
          {post.content}
        </div>

        <div className="mt-6 flex flex-wrap gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            이전으로
          </Button>

          <Link href="/posts" className={buttonVariants()}>
            목록으로
          </Link>

          <LikeButton
            postId={post.id}
            liked={post.likedByCurrentUser}
            likeCount={post.likeCount}
            isOwnPost={isAuthor}
            onLikeChangeAction={handleLikeChange}
          />

          <BookmarkButton
            postId={post.id}
            bookmarked={post.bookmarkedByCurrentUser}
            bookmarkCount={post.bookmarkCount}
            onBookmarkChangeAction={handleBookmarkChange}
          />

          {isAuthor && (
            <Link
              href={`/posts/${post.id}/edit`}
              className={buttonVariants({ variant: "outline" })}
            >
              수정
            </Link>
          )}

          {isAuthor && (
            <Button
              type="button"
              onClick={handleDeletePost}
              disabled={isDeleting}
              variant="destructive"
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          )}
        </div>

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
