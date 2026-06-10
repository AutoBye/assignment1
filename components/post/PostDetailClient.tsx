"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CommentPaginationResponse } from "@/types/api";
import type { CommentItem } from "@/types/comment";
import type { DeletePostResponse, PostDetail } from "@/types/post";
import CommentSection from "@/components/comments/CommentSection";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDate } from "@/lib/date";
import LikeButton from "@/components/post/LikeButton";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
// 5번 과제는 components/post/PostDetailClient.tsx에서 부모 state가 자식 콜백으로 바뀌는 흐름
// > 자식 컴포넌트가 직접 부모 state를 바꾸는 게 아니라, 부모가 넘겨준 함수를 호출해서 부모 state를 바꾼다.
// React 에서는 데이터 흐름을 보통 위에서 아래로 둠
// 부모가 자식에게 데이터를 내려줌 -> 자식이 부모에게 변경을 알려야 할 때는 함수를 받음
// 이 패턴을 “state lifting” 또는 “callback props”라고 봄

// 5번 과제의 핵심
//     자식 이벤트 발생
//   → 자식이 props로 받은 callback 호출
//   → 부모 state 변경
//   → 부모 재렌더링
//   → 새 props가 자식에게 내려감

// 지금은 부모 - 자식 사이에서 콜백으로 해결, 컴포넌트 관계가 멀어지면 전역 상태나 서버 상태 관리 도구 필요해짐
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

/** Post 상세 화면
 * @param postId string
 * @param initialPost PostDetail or null
 * @param initialComments CommentItem[]
 * @param initialCommentPagination CommentPaginationResponse
 * */
export default function PostDetailClient({
  initialPost,
  initialComments,
  initialCommentPagination,
}: PostDetailClientProps) {
  const router = useRouter();
  const { currentUser } = useCurrentUser();

  const [detailState, setDetailState] = useState<PostDetailState>({
    post: initialPost,
    message: "",
    isDeleting: false,
  });

  const { post, message, isDeleting } = detailState;

  // 1번 과제: state 변경으로 인한 렌더링 흐름 관찰
  // console.log("PostDetailClient render", {
  //   postId,
  //   postLikeCount: post?.likeCount,
  //   postCommentCount: post?.commentCount,
  //   likedByCurrentUser: post?.likedByCurrentUser,
  //   message,
  //   isDeleting,
  // });

  // 3번 과제: Hook은 조건문 위에서 항상 같은 순서로 호출한다.
  // 아래 조건부 return들은 Hook 호출 이후에만 실행된다.

  /** 글 삭제 핸들러
   * <br> `/api/posts/${post.id}`
   * <br> `replace(/posts)`
   * <br>
   * <br>
   * */
  async function handleDeletePost() {
    if (!post) {
      return;
    }

    const confirmed = window.confirm("정말 이 게시글을 삭제하시겠습니까?");

    if (!confirmed) {
      return;
    }

    setDetailState((currentState) => ({
      ...currentState,
      message: "",
      isDeleting: true,
    }));

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      });

      const data = (await response.json()) as DeletePostResponse;

      if (!response.ok) {
        setDetailState((currentState) => ({
          ...currentState,
          message: data.message ?? "게시글 삭제에 실패했습니다.",
        }));
        return;
      }

      router.replace(`/posts`);
      router.refresh();
    } catch {
      setDetailState((currentState) => ({
        ...currentState,
        message: "게시글 삭제 요청중 오류가 발생했습니다.",
      }));
    } finally {
      setDetailState((currentState) => ({
        ...currentState,
        isDeleting: false,
      }));
    }
  }

  /** 댓글 수 카운트
   * @param amount number : 댓글 갯수
   * @desc <br> 5번 과제 : 자식 CommentSection이 댓글 개수 변경을 부모에게 알려준다.
   * <br>
   */
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

  /** 좋아요 수 카운트
   * @param likeCount number: 좋아요 갯수
   * @param liked boolean: 좋아요 여부
   * @desc <br> 5번 과제: 자식 LikeButton이 좋아요 상태 변경을 부모에게 알려준다.
   * <br>
   */
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
              좋아요 {post.likeCount}개 · 댓글 {post.commentCount}개 · 북마크{" "}
              {post.bookmarkCount}개
            </p>
          </div>

          <div className="min-h-60 whitespace-pre-wrap text-sm leading-7">
            {post.content}
          </div>

          <div className="mt-6 flex flex-wrap gap-2 border-t pt-4">
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

            <LikeButton
              postId={post.id}
              liked={post.likedByCurrentUser}
              likeCount={post.likeCount}
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
            postId={post.id}
            initialComments={initialComments}
            initialPagination={initialCommentPagination}
            onCommentCountChange={handleCommentCountChange}
          />
        </CardContent>
      </Card>
  );
}

/** 1~5번과제 적용 전 PostDetailClient
 * @deprecated 1 ~ 5번 공부내용 적용 후 사용 안해용
 * <br> 기록용으로 남겨두긴함
 * <br> 06-10 import 잡아먹어서 날림...
 * */
