"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { SubmitEventHandler } from "react";
import type { PostDetailResponse, UpdatePostResponse } from "@/types/post";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { useErrorModalStore } from "@/lib/stores/error-modal-store";
import { useToastStore } from "@/lib/stores/toast-store";

type PostEditFormProps = {
  postId: string;
};

type PostEditFormState = {
  title: string;
  content: string;
  message: string;
  isLoading: boolean;
  isSubmitting: boolean;
  isAuthor: boolean;
};

export default function PostEditForm({ postId }: PostEditFormProps) {
  const router = useRouter();

  const { currentUser } = useCurrentUser();
  const currentUserId = currentUser?.id;

  const [formState, setFormState] = useState<PostEditFormState>({
    title: "",
    content: "",
    message: "",
    isLoading: false,
    isSubmitting: false,
    isAuthor: false,
  });

  const openErrorModal = useErrorModalStore((state) => state.openErrorModal);
  const showToast = useToastStore((state) => state.showToast);
  // console.log("PostEditForm render", {
  //   postId,
  //   currentUserId: currentUser.id,
  //   ...formState,
  // });

  // 1. useState 변경으로 인한 렌더링
  // 2. useEffect 실행 시점
  // 3. cleanup 함수 실행 시점
  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    const abortController = new AbortController();

    async function fetchPost() {
      try {
        setFormState((currentState) => ({
          ...currentState,
          message: "",
          isLoading: true,
        }));

        const response = await fetch(`/api/posts/${postId}`, {
          method: "GET",
          signal: abortController.signal,
        });

        const data = (await response.json()) as PostDetailResponse;

        // console.log("fetchPost response", {
        //   ok: response.ok,
        //   postId: data.post?.id,
        //   authorId: data.post?.author.id,
        // });

        // 응답 X
        if (!response.ok) {
          setFormState((currentState) => ({
            ...currentState,
            message: data.message ?? "게시글 조회에 실패했습니다.",
            isAuthor: false,
          }));
          return;
        }

        // 포스트 찾기
        if (!data.post) {
          setFormState((currentState) => ({
            ...currentState,
            message: "게시글 응답이 올바르지 않습니다.",
            isAuthor: false,
          }));
          return;
        }

        // 자기가 쓴 글인가
        const post = data.post;
        if (post.author.id !== currentUserId) {
          setFormState((currentState) => ({
            ...currentState,
            message: "게시글을 수정할 권한이 없습니다.",
            isAuthor: false,
          }));
          return;
        }

        setFormState((currentState) => ({
          ...currentState,
          title: post.title,
          content: post.content,
          message: "",
          isAuthor: true,
        }));
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setFormState((currentState) => ({
          ...currentState,
          message: "게시글 조회 요청 중 오류가 발생했습니다.",
          isAuthor: false,
        }));
      } finally {
        if (!abortController.signal.aborted) {
          setFormState((currentState) => ({
            ...currentState,
            isLoading: false,
          }));
        }
      }
    }

    void fetchPost();

    return () => {
      console.log("PostEditForm effect cleanup");
      abortController.abort();
    };
  }, [postId, currentUserId]);

  // 수정 핸들러
  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    setFormState((currentState) => ({
      ...currentState,
      message: "",
      isSubmitting: true,
    }));

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formState.title,
          content: formState.content,
        }),
      });

      const data = (await response.json()) as UpdatePostResponse;

      // 반응 X
      if (!response.ok) {
        openErrorModal(data.message ?? "게시글 수정에 실패했습니다.");
        return;
      }

      // 응답 정상 X
      if (!data.post) {
        openErrorModal("게시글 수정 응답이 올바르지 않습니다.");
        return;
      }

      const updatedPost = data.post;

      showToast({
        type: "success",
        message: "게시글이 수정되었습니다.",
      });

      router.replace(`/posts/${updatedPost.id}`);
      router.refresh();
    } catch {
      openErrorModal("게시글 수정 요청 중 오류가 발생했습니다.");
    } finally {
      setFormState((currentState) => ({
        ...currentState,
        isSubmitting: false,
      }));
    }
  };

  // 로딩중
  if (formState.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">게시글 수정</CardTitle>
          <CardDescription>게시글을 불러오는 중입니다.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-60 w-full" />
        </CardContent>
      </Card>
    );
  }

  // 내가 쓴 글이 아님
  if (!formState.isAuthor) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">수정 불가</CardTitle>
          <CardDescription>
            {formState.message || "게시글을 수정할 수 없습니다."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Link href="/posts" className={buttonVariants()}>
            목록으로
          </Link>
        </CardContent>
      </Card>
    );
  }

  // 정상 진입
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-2xl">게시글 수정</CardTitle>

        <Link
          href={`/posts/${postId}`}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          상세보기로
        </Link>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="mb-1 block text-sm font-medium">
              제목
            </label>

            <Input
              id="title"
              type="text"
              value={formState.title}
              onChange={(event) =>
                setFormState((currentState) => ({
                  ...currentState,
                  title: event.target.value,
                }))
              }
              placeholder="게시글 제목을 입력하세요."
            />

            <p className="mt-1 text-xs text-muted-foreground">
              제목은 2자 이상 200자 이하로 입력해주세요.
            </p>
          </div>

          <div>
            <label htmlFor="content" className="mb-1 block text-sm font-medium">
              내용
            </label>

            <Textarea
              id="content"
              value={formState.content}
              onChange={(event) =>
                setFormState((currentState) => ({
                  ...currentState,
                  content: event.target.value,
                }))
              }
              className="min-h-60 resize-y"
              placeholder="게시글 내용을 입력하세요."
            />

            <p className="mt-1 text-xs text-muted-foreground">
              내용은 2자 이상 입력해주세요.
            </p>
          </div>

          {formState.message && (
            <Alert variant="destructive">
              <AlertDescription>{formState.message}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? "수정 중..." : "수정하기"}
            </Button>

            <Link
              href={`/posts/${postId}`}
              className={buttonVariants({ variant: "outline" })}
            >
              취소
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
