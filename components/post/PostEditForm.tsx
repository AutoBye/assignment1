"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { SubmitEventHandler } from "react";
import {
  POST_CONTENT_MIN_LENGTH,
  POST_TITLE_MAX_LENGTH,
  POST_TITLE_MIN_LENGTH,
} from "@/lib/constants";
import { getErrorMessage } from "@/lib/api/client";
import {
  fetchPostDetailRequest,
  updatePostRequest,
} from "@/lib/queries/posts-query";
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
  const { currentUser, isLoading: isCurrentUserLoading } = useCurrentUser();
  const currentUserId = currentUser?.id;

  const [formState, setFormState] = useState<PostEditFormState>({
    title: "",
    content: "",
    message: "",
    isLoading: true,
    isSubmitting: false,
    isAuthor: false,
  });

  const openErrorModal = useErrorModalStore((state) => state.openErrorModal);
  const showToast = useToastStore((state) => state.showToast);

  useEffect(() => {
    if (isCurrentUserLoading) {
      return;
    }

    if (!currentUserId) {
      setFormState((currentState) => ({
        ...currentState,
        message: "로그인이 필요합니다.",
        isLoading: false,
        isAuthor: false,
      }));
      return;
    }

    const abortController = new AbortController();

    async function loadPost() {
      setFormState((currentState) => ({
        ...currentState,
        message: "",
        isLoading: true,
      }));

      try {
        const post = await fetchPostDetailRequest(
          postId,
          abortController.signal,
        );

        if (post.author.id !== currentUserId) {
          setFormState((currentState) => ({
            ...currentState,
            message: "게시글을 수정할 권한이 없습니다.",
            isLoading: false,
            isAuthor: false,
          }));
          return;
        }

        setFormState((currentState) => ({
          ...currentState,
          title: post.title,
          content: post.content,
          message: "",
          isLoading: false,
          isAuthor: true,
        }));
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setFormState((currentState) => ({
          ...currentState,
          message: getErrorMessage(
            error,
            "게시글 조회 요청 중 오류가 발생했습니다.",
          ),
          isLoading: false,
          isAuthor: false,
        }));
      }
    }

    void loadPost();

    return () => {
      abortController.abort();
    };
  }, [postId, currentUserId, isCurrentUserLoading]);

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    const title = formState.title.trim();
    const content = formState.content.trim();

    if (!title || !content) {
      openErrorModal("제목과 내용을 모두 입력해주세요.");
      return;
    }

    if (
      title.length < POST_TITLE_MIN_LENGTH ||
      title.length > POST_TITLE_MAX_LENGTH
    ) {
      openErrorModal(
        `제목은 ${POST_TITLE_MIN_LENGTH}자 이상 ${POST_TITLE_MAX_LENGTH}자 이하로 입력해주세요.`,
      );
      return;
    }

    if (content.length < POST_CONTENT_MIN_LENGTH) {
      openErrorModal(`내용은 ${POST_CONTENT_MIN_LENGTH}자 이상 입력해주세요.`);
      return;
    }

    setFormState((currentState) => ({
      ...currentState,
      message: "",
      isSubmitting: true,
    }));

    try {
      const data = await updatePostRequest(postId, {
        title,
        content,
      });

      showToast({
        type: "success",
        message: data.message,
      });

      router.replace(`/posts/${data.post.id}`);
      router.refresh();
    } catch (error) {
      openErrorModal(
        getErrorMessage(error, "게시글 수정 요청 중 오류가 발생했습니다."),
      );
    } finally {
      setFormState((currentState) => ({
        ...currentState,
        isSubmitting: false,
      }));
    }
  };

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
              minLength={POST_TITLE_MIN_LENGTH}
              maxLength={POST_TITLE_MAX_LENGTH}
            />

            <p className="mt-1 text-xs text-muted-foreground">
              제목은 {POST_TITLE_MIN_LENGTH}자 이상 {POST_TITLE_MAX_LENGTH}자
              이하로 입력해주세요.
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
              내용은 {POST_CONTENT_MIN_LENGTH}자 이상 입력해주세요.
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
