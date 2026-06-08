"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CommentSection from "@/components/comments/CommentSection";

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
  updatedAt: string;
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

type PostDetailClientProps = {
  postId: string;
  currentUser: CurrentUser | null;
};

type DeletePostResponse = {
  message?: string;
};

function formatDate(value: string) {
  const date = new Date(value);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export default function PostDetailClient({ postId, currentUser }: PostDetailClientProps) {
  const router = useRouter();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // 글 자세히보기 관련 Effect
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

        // 응답 체크
        if (!response.ok) {
          setMessage(data.message ?? "게시글 조회에 실패했습니다.");
          return;
        }

        // 포스트 데이터 없음
        if (!data.post) {
          setMessage("게시글 응답이 올바르지 않습니다.");
          return;
        }

        setPost(data.post);
      } catch (error) {
        if (error instanceof DOMException && error.name == "AbortError") {
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
  }, [postId]);

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
    } catch (error) {
      setMessage("게시글 삭제 요청 중 오류가 발생했습니다.");
      console.log(error);
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

  // 로딩중 JSX
  if (isLoading) {
    return (
      <section className="rounded border bg-white p-6">
        <p className="text-sm text-gray-500">게시글을 불러오는 중입니다.</p>
      </section>
    );
  }

  // 응답x JSX
  if (message) {
    return (
      <section className="rounded border bg-white p-6">
        <h1 className="mb-2 text-2xl font-bold">게시글 조회 실패</h1>

        <p className="mb-4 text-sm text-red-500">{message}</p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded border px-4 py-2"
          >
            이전으로
          </button>

          <Link href="/" className="rounded bg-blue-500 px-4 py-2 text-white">
            메인으로
          </Link>
        </div>
      </section>
    );
  }

  // 게시글 없음 JSX
  if (!post) {
    return (
      <section className="rounded border bg-white p-6">
        <p className="text-sm text-gray-500">게시글이 없습니다.</p>
      </section>
    );
  }

  // 삭제용 작성자 확인
  const isAuthor = currentUser?.id === post.author.id;

  // 응답 JSX
  return (
    <section className="rounded border bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{post.title}</h1>

        <Link href="/" className="text-sm text-gray-500 hover:text-blue-500">
          메인으로
        </Link>
      </div>

      <div className="mb-6 border-b pb-4 text-sm text-gray-600">
        <p>작성자: {post.author.name}</p>
        <p>작성일: {formatDate(post.createdAt)}</p>
        <p>수정일: {formatDate(post.updatedAt)}</p>
        <p>
          좋아요 {post.likeCount}개 · 댓글 {post.commentCount}개 · 북마크{" "}
          {post.bookmarkCount}개
        </p>
      </div>

      <div className="min-h-60 whitespace-pre-wrap text-gray-800">
        {post.content}
      </div>

      <div className="mt-6 flex gap-2 border-t pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded border px-4 py-2"
        >
          이전으로
        </button>

        <Link href="/" className="rounded bg-blue-500 px-4 py-2 text-white">
          목록으로
        </Link>

        {isAuthor && (
            <Link
                href={`/posts/${post.id}/edit`}
                className="rounded border px-4 py-2"
            >
              수정
            </Link>
        )}

        {isAuthor && (
            <button
                type="button"
                onClick={handleDeletePost}
                disabled={isDeleting}
                className="rounded bg-red-500 px-4 py-2 text-white disabled:bg-gray-400"
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </button>
        )}
      </div>
      <CommentSection
          postId={post.id}
          currentUser={currentUser}
          onCommentCountChange={handleCommentCountChange}
      />
    </section>
  );
}
