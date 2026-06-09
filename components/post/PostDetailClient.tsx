"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CommentSection from "@/components/comments/CommentSection";
import LikeButton from "@/components/post/LikeButton";
import { formatDate } from "@/lib/date";
import type { CommentPaginationResponse } from "@/types/api";
import type { CurrentUser } from "@/types/auth";
import type { CommentItem } from "@/types/comment";
import type { DeletePostResponse, PostDetail } from "@/types/post";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PostDetailClientProps = {
  postId: string;
  currentUser: CurrentUser | null;
  initialPost: PostDetail | null;
  initialComments: CommentItem[];
  initialCommentPagination: CommentPaginationResponse;
};

export default function PostDetailClient({
  postId,
  currentUser,
  initialPost,
  initialComments,
  initialCommentPagination,
}: PostDetailClientProps) {
  const router = useRouter();

  const [post, setPost] = useState<PostDetail | null>(initialPost);
  const [message, setMessage] = useState("");

  const [isDeleting, setIsDeleting] = useState(false);

  // 글 자세히보기 관련 Effect - 삭제됨

  async function handleDeletePost() {
    // 글 존재 체크
    if (!post) {
      return;
    }

    const confirmed = window.confirm("정말 이 게시글을 삭제하시겠습니까?");

    // 삭제 취소
    if (!confirmed) {
      return;
    }

    setMessage("");
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      });

      const data = (await response.json()) as DeletePostResponse;

      if (!response.ok) {
        setMessage(data.message ?? "게시글 삭제에 실패했습니다.");
        return;
      }

      router.replace("/posts");
      router.refresh();
    } catch {
      setMessage("게시글 삭제 요청 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  }

  function handleCommentCountChange(amount: number) {
    setPost((currentPost) => {
      if (!currentPost) {
        return currentPost;
      }

      return {
        ...currentPost,
        commentCount: Math.max(0, currentPost.commentCount + amount),
      };
    });
  }

  function handleLikeChange(likeCount: number, liked: boolean) {
    setPost((currentPost) => {
      if (!currentPost) {
        return currentPost;
      }

      return {
        ...currentPost,
        likeCount,
        likedByCurrentUser: liked,
      };
    });
  }

  // 응답x JSX
  if (message) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">게시글 조회 실패</CardTitle>
          <CardDescription>{message}</CardDescription>
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

            <Link href="/" className={buttonVariants()}>
              메인으로
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 게시글 없음 JSX
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

  // 삭제용 작성자 확인
  const isAuthor = currentUser?.id === post.author.id;

  // 응답 JSX
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
            <p>작성자: {post.author.name}</p>
            <p>작성일: {formatDate(post.createdAt)}</p>
            <p>수정일: {formatDate(post.updatedAt)}</p>
            <p>
              좋아요 {post.likeCount}개 · 댓글 {post.commentCount}개 · 북마크{" "}
              {post.bookmarkCount}개
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
                initialLiked={post.likedByCurrentUser}
                initialLikeCount={post.likeCount}
                isLoggedIn={currentUser !== null}
                isOwnPost={isAuthor}
                onLikeChange={handleLikeChange}
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
              postId={postId}
              currentUser={currentUser}
              initialComments={initialComments}
              initialPagination={initialCommentPagination}
              onCommentCountChange={handleCommentCountChange}
          />
        </CardContent>
      </Card>
  );
}
