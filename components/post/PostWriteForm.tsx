"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SubmitEventHandler } from "react";

export default function PostWriteForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    setMessage("");
    setIsLoading(true);

	// TODO - 글 작성 후 게시글 상세 페이지로 이동
	  // 현재는 메인 페이지로 이동
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });

      const data = (await response.json()) as {
        message?: string;
        post?: {
          id: string;
        };
      };

      if (!response.ok) {
        setMessage(data.message ?? "게시글 작성에 실패했습니다.");
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setMessage("게시글 작성 요청 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded border bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">글쓰기</h1>

        <Link href="/" className="text-sm text-gray-500 hover:text-blue-500">
          메인으로
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium">
            제목
          </label>

          <input
            id="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="게시글 제목을 입력하세요"
          />

          <p className="mt-1 text-xs text-gray-500">
            제목은 2자 이상 200자 이하로 입력해주세요.
          </p>
        </div>

        <div>
          <label htmlFor="content" className="mb-1 block text-sm font-medium">
            내용
          </label>

          <textarea
            id="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="min-h-60 w-full resize-y rounded border px-3 py-2"
            placeholder="게시글 내용을 입력하세요"
          />

          <p className="mt-1 text-xs text-gray-500">
            내용은 2자 이상 입력해주세요.
          </p>
        </div>

        {message && <p className="text-sm text-red-500">{message}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isLoading}
            className="rounded bg-blue-500 px-4 py-2 text-white disabled:bg-gray-400"
          >
            {isLoading ? "작성 중..." : "작성하기"}
          </button>

          <Link href="/" className="rounded border px-4 py-2">
            취소
          </Link>
        </div>
      </form>
    </section>
  );
}
