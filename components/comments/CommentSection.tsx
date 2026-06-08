"use client";

import { useEffect, useState } from "react";
import type { SubmitEventHandler } from "react";

type CurrentUser = {
  id: string;
  email: string;
  name: string;
};

type CommentItem = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
};

type CommentsResponse = {
  message?: string;
  comments?: CommentItem[];
};

type CreateCommentResponse = {
  message?: string;
  comment?: CommentItem;
};

type DeleteCommentResponse = {
  message?: string;
};

type CommentSectionProps = {
  postId: string;
  currentUser: CurrentUser | null;
  onCommentCountChange?: (amount: number) => void;
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export default function CommentSection({
  postId,
  currentUser,
  onCommentCountChange,
}: CommentSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const abortController = new AbortController();

    async function fetchComments() {
      try {
        const response = await fetch(`/api/posts/${postId}/comments`, {
          method: "GET",
          signal: abortController.signal,
        });

        const data = (await response.json()) as CommentsResponse;

        if (!response.ok) {
          setMessage(data.message ?? "댓글 조회에 실패했습니다.");
          return;
        }

        setComments(data.comments ?? []);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setMessage("댓글 조회 요청 중 오류가 발생했습니다.");
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void fetchComments();

    return () => {
      abortController.abort();
    };
  }, [postId]);

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    setMessage("");

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      setMessage("댓글 내용을 입력해주세요.");
      return;
    }

    if (trimmedContent.length < 2 || trimmedContent.length > 1000) {
      setMessage("댓글은 2자 이상 1000자 이하로 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: trimmedContent,
        }),
      });

      const data = (await response.json()) as CreateCommentResponse;

      if (!response.ok) {
        setMessage(data.message ?? "댓글 작성에 실패했습니다.");
        return;
      }

      if (!data.comment) {
        setMessage("댓글 작성 응답이 올바르지 않습니다.");
        return;
      }

      setComments((currentComments) => [...currentComments, data.comment!]);
      setContent("");
      onCommentCountChange?.(1);
    } catch {
      setMessage("댓글 작성 요청 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };


  async function handleDeleteComment(commentId: string) {
    const confirmed = window.confirm("댓글을 삭제하시겠습니까?");

    if (!confirmed) {
      return;
    }

    setMessage("");
    setDeletingCommentId(commentId);

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      const data = (await response.json()) as DeleteCommentResponse;

	  // 응답 체크
      if (!response.ok) {
        setMessage(data.message ?? "댓글 삭제에 실패했습니다.");
        return;
      }

      setComments((currentComments) =>
        currentComments.filter((comment) => comment.id !== commentId),
      );
      onCommentCountChange?.(-1);
    } catch {
      setMessage("댓글 삭제 요청 중 오류가 발생했습니다.");
    } finally {
      setDeletingCommentId(null);
    }
  }

  return (
    <section className="mt-6 rounded border bg-white p-6">
      <h2 className="mb-4 text-xl font-bold">댓글</h2>

      {currentUser ? (
        <form onSubmit={handleSubmit} className="mb-6 space-y-3">
          <div>
            <label htmlFor="comment" className="mb-1 block text-sm font-medium">
              댓글 작성
            </label>

            <textarea
              id="comment"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="min-h-24 w-full resize-y rounded border px-3 py-2"
              placeholder="댓글을 입력하세요"
            />

            <p className="mt-1 text-xs text-gray-500">
              댓글은 2자 이상 1000자 이하로 입력해주세요.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded bg-blue-500 px-4 py-2 text-white disabled:bg-gray-400"
          >
            {isSubmitting ? "작성 중..." : "댓글 작성"}
          </button>
        </form>
      ) : (
        <p className="mb-6 rounded border bg-gray-50 p-4 text-sm text-gray-600">
          댓글을 작성하려면 로그인이 필요합니다.
        </p>
      )}

      {message && <p className="mb-4 text-sm text-red-500">{message}</p>}

      {isLoading ? (
        <p className="text-sm text-gray-500">댓글을 불러오는 중입니다.</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-500">아직 작성된 댓글이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => {
            const isAuthor = currentUser?.id === comment.author.id;

            return (
              <article key={comment.id} className="rounded border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">
                      {comment.author.name}
                    </span>
                    <span> · {formatDate(comment.createdAt)}</span>
                  </div>

                  {isAuthor && (
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment.id)}
                      disabled={deletingCommentId === comment.id}
                      className="text-sm text-red-500 disabled:text-gray-400"
                    >
                      {deletingCommentId === comment.id ? "삭제 중..." : "삭제"}
                    </button>
                  )}
                </div>

                <p className="whitespace-pre-wrap text-sm text-gray-800">
                  {comment.content}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
