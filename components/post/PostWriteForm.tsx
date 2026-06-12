"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SubmitEventHandler } from "react";
import { useState } from "react";
import {
  POST_CONTENT_MIN_LENGTH,
  POST_TITLE_MAX_LENGTH,
  POST_TITLE_MIN_LENGTH,
} from "@/lib/constants";
import { getErrorMessage } from "@/lib/api/client";
import { createPostRequest } from "@/lib/queries/posts-query";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useErrorModalStore } from "@/lib/stores/error-modal-store";
import { usePostDraftStore } from "@/lib/stores/post-draft-store";
import { useToastStore } from "@/lib/stores/toast-store";

export default function PostWriteForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const title = usePostDraftStore((state) => state.title);
  const content = usePostDraftStore((state) => state.content);
  const setTitle = usePostDraftStore((state) => state.setTitle);
  const setContent = usePostDraftStore((state) => state.setContent);
  const resetDraft = usePostDraftStore((state) => state.resetDraft);

  const openErrorModal = useErrorModalStore((state) => state.openErrorModal);
  const showToast = useToastStore((state) => state.showToast);

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      openErrorModal("제목과 내용을 모두 입력해주세요.");
      return;
    }

    if (
      trimmedTitle.length < POST_TITLE_MIN_LENGTH ||
      trimmedTitle.length > POST_TITLE_MAX_LENGTH
    ) {
      openErrorModal(
        `제목은 ${POST_TITLE_MIN_LENGTH}자 이상 ${POST_TITLE_MAX_LENGTH}자 이하로 입력해주세요.`,
      );
      return;
    }

    if (trimmedContent.length < POST_CONTENT_MIN_LENGTH) {
      openErrorModal(`내용은 ${POST_CONTENT_MIN_LENGTH}자 이상 입력해주세요.`);
      return;
    }

    setIsLoading(true);

    try {
      const data = await createPostRequest({
        title: trimmedTitle,
        content: trimmedContent,
      });

      resetDraft();

      showToast({
        type: "success",
        message: data.message,
      });

      router.replace(`/posts/${data.post.id}`);
      router.refresh();
    } catch (error) {
      openErrorModal(
        getErrorMessage(error, "게시글 작성 요청 중 오류가 발생했습니다."),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-2xl">글쓰기</CardTitle>

        <Link
          href="/"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          메인으로
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
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="게시글 제목을 입력하세요"
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
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="min-h-60 resize-y"
              placeholder="게시글 내용을 입력하세요"
            />

            <p className="mt-1 text-xs text-muted-foreground">
              내용은 {POST_CONTENT_MIN_LENGTH}자 이상 입력해주세요.
            </p>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "작성 중..." : "작성하기"}
            </Button>

            <Link
              href="/posts"
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
