"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SubmitEventHandler } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useErrorModalStore } from "@/lib/stores/error-modal-store";
import { usePostDraftStore } from "@/lib/stores/post-draft-store";

type CreatePostResponse = {
  message?: string;
  post?: {
    id: string;
  };
};

export default function PostWriteForm() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const title = usePostDraftStore((state) => state.title);
  const content = usePostDraftStore((state) => state.content);
  const setTitle = usePostDraftStore((state) => state.setTitle);
  const setContent = usePostDraftStore((state) => state.setContent);
  const resetDraft = usePostDraftStore((state) => state.resetDraft);

  const openErrorModal = useErrorModalStore((state) => state.openErrorModal);

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      openErrorModal("제목을 입력해주세요.");
      return;
    }

    if (!trimmedContent) {
      openErrorModal("내용을 입력해주세요.");
      return;
    }

    setIsLoading(true);

    // DONE - 글 작성 후 게시글 상세 페이지로 이동
    // 현재는 메인 페이지로 이동
    try {
      const response = await fetch(`/api/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: trimmedTitle,
          content: trimmedContent,
        }),
      });

      const data = (await response.json()) as CreatePostResponse;

      if (!response.ok) {
        openErrorModal(data.message ?? "게시글 작성에 실패했습니다.");
        return;
      }

      if (!data.post) {
        openErrorModal("게시글 작성 응답이 올바르지 않습니다.");
        return;
      }

      resetDraft();

      router.replace(`/posts/${data.post.id}`);
      router.refresh();
    } catch {
      openErrorModal("게시글 작성 요청 중 오류가 발생했습니다.");
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
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="min-h-60 resize-y"
              placeholder="게시글 내용을 입력하세요"
            />

            <p className="mt-1 text-xs text-muted-foreground">
              내용은 2자 이상 입력해주세요.
            </p>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "작성 중..." : "작성하기"}
            </Button>

            <Link href="/" className={buttonVariants({ variant: "outline" })}>
              취소
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
