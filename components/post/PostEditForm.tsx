"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { SubmitEventHandler } from "react";

type CurrentUser = {
  id: string;
  email: string;
  name: string;
};

type PostDetail = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updateAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  commentCount: number;
  likeCount: number;
  bookmarkCount: number;
};

type PostDetailResponse = {
  message?: string;
  post?: PostDetail;
};

type UpdatePostResponse = {
  message?: string;
  post?: {
    id: string;
  };
};

type PostEditFormProps = {
  postId: string;
  currentUser: CurrentUser;
};

export default function PostEditForm({
  postId,
  currentUser,
}: PostEditFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthor, setIsAuthor] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();

    async function fetchPost() {
      try {
        setIsLoading(true);
        setMessage("");

        const response = await fetch(`/api/posts/${postId}`, {
          method: "GET",
          signal: abortController.signal,
        });

        const data = (await response.json()) as PostDetailResponse;

        // 응답 확인
        if (!response.ok) {
          setMessage(data.message ?? "게시글 조회에 실패했습니다.");
          return;
        }

        // 메소드 확인
        if (!data.post) {
          setMessage("게시글 응답이 올바르지 않습니다.");
		  return
        }


        if (data.post.author.id !== currentUser.id) {
          setMessage("게시글을 수정할 권한이 없습니다.");
          setIsAuthor(false);
          return;
        }

        setTitle(data.post.title);
        setContent(data.post.content);
        setIsAuthor(true);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setMessage("게시글 조회 요청 중 오류가 발생했습니다.");
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void fetchPost();

    return () => {
      abortController.abort();
    };
  }, [postId, currentUser]);

  // 수정 제출
  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });

      const data = (await response.json()) as UpdatePostResponse;

	  // 응답 체크
      if (!response.ok) {
        setMessage(data.message ?? "게시글 수정에 실패했습니다.");
        return;
      }

	  // 데이터 체크
      if (!data.post) {
        setMessage("게시글 수정 응답이 올바르지 않습니다.");
        return;
      }

      router.replace(`/posts/${data.post.id}`);
      router.refresh();
    } catch {
      setMessage("게시글 수정 요청 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 로딩중
  if (isLoading) {
    return (
      <section className="rounded border bg-white p-6">
        <p className="text-sm text-gray-500">게시글을 불러오는 중입니다.</p>
      </section>
    );
  }

  // 작성자 아니면
  if (!isAuthor) {
    return (
      <section className="rounded border bg-white p-6">
        <h1 className="mb-2 text-2xl font-bold">수정 불가</h1>

        <p className="mb-4 text-sm text-red-500">
          {message || "게시글을 수정할 수 없습니다."}
        </p>

        <Link
          href="/posts"
          className="rounded bg-blue-500 px-4 py-2 text-white"
        >
          목록으로
        </Link>
      </section>
    );
  }

  // 정상경로
  return (
    <section className="rounded border bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">게시글 수정</h1>

        <Link
          href={`/posts/${postId}`}
          className="text-sm text-gray-500 hover:text-blue-500"
        >
          상세보기로
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
            disabled={isSubmitting}
            className="rounded bg-blue-500 px-4 py-2 text-white disabled:bg-gray-400"
          >
            {isSubmitting ? "수정 중..." : "수정하기"}
          </button>

          <Link href={`/posts/${postId}`} className="rounded border px-4 py-2">
            취소
          </Link>
        </div>
      </form>
    </section>
  );
}
