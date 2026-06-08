// Next.js는 "use client" 파일의 props가 Server Component에서 Client Component로 넘어올 수 있다고 보고, props가 직렬화 가능해야 한다고 검사함
// 함수는 직렬화할 수 없기 때문에 TS71007이 발생

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
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  replies: CommentItem[];
};

type CommentsResponse = {
  message?: string;
  comments?: CommentItem[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalRootCommentCount: number;
    commentsPerPage: number;
  };
};

type CreateCommentResponse = {
  message?: string;
  comment?: CommentItem;
};

type UpdateCommentResponse = {
  message?: string;
  comment?: {
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

function appendComment(comments: CommentItem[], newComment: CommentItem) {
  if (newComment.parentId === null) {
    return [newComment, ...comments];
  }

  return comments.map((comment) => {
    if (comment.id === newComment.parentId) {
      return {
        ...comment,
        replies: [...comment.replies, newComment],
      };
    }

    return comment;
  });
}

function updateCommentInTree(
  comments: CommentItem[],
  updatedComment: UpdateCommentResponse["comment"],
) {
  if (!updatedComment) {
    return comments;
  }

  return comments.map((comment) => {
    if (comment.id === updatedComment.id) {
      return {
        ...comment,
        content: updatedComment.content,
        createdAt: updatedComment.createdAt,
        updatedAt: updatedComment.updatedAt,
        author: updatedComment.author,
      };
    }

    return {
      ...comment,
      replies: comment.replies.map((reply) => {
        if (reply.id === updatedComment.id) {
          return {
            ...reply,
            content: updatedComment.content,
            createdAt: updatedComment.createdAt,
            updatedAt: updatedComment.updatedAt,
            author: updatedComment.author,
          };
        }

        return reply;
      }),
    };
  });
}

function countCommentAndReplies(comment: CommentItem) {
  return 1 + comment.replies.length;
}

function findDeleteCount(comments: CommentItem[], commentId: string) {
  for (const comment of comments) {
    if (comment.id === commentId) {
      return countCommentAndReplies(comment);
    }

    const reply = comment.replies.find((item) => item.id === commentId);

    if (reply) {
      return 1;
    }
  }

  return 1;
}

function removeCommentFromTree(comments: CommentItem[], commentId: string) {
  return comments
    .filter((comment) => comment.id !== commentId)
    .map((comment) => ({
      ...comment,
      replies: comment.replies.filter((reply) => reply.id !== commentId),
    }));
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

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRootCommentCount, setTotalRootCommentCount] = useState(0);

  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null,
  );

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [updatingCommentId, setUpdatingCommentId] = useState<string | null>(
    null,
  );

  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(
    null,
  );
  const [replyContent, setReplyContent] = useState("");
  const [submittingReplyParentId, setSubmittingReplyParentId] = useState<
    string | null
  >(null);

  async function fetchComments(page: number) {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/posts/${postId}/comments?page=${page}`,
        {
          method: "GET",
        },
      );

      const data = (await response.json()) as CommentsResponse;

      if (!response.ok) {
        setMessage(data.message ?? "댓글 조회에 실패했습니다.");
        return;
      }

      setComments(data.comments ?? []);

      if (data.pagination) {
        setCurrentPage(data.pagination.currentPage);
        setTotalPages(data.pagination.totalPages);
        setTotalRootCommentCount(data.pagination.totalRootCommentCount);
      }
    } catch {
      setMessage("댓글 조회 요청 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void fetchComments(1);
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

      const createdComment = data.comment;

      if (!createdComment) {
        setMessage("댓글 작성 응답이 올바르지 않습니다.");
        return;
      }

      setContent("");
      onCommentCountChange?.(1);

      // 일반 댓글은 최신순 첫 페이지에 보이도록 1페이지를 다시 불러온다.
      await fetchComments(1);
    } catch {
      setMessage("댓글 작성 요청 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  async function handleCreateReply(parentId: string) {
    setMessage("");

    const trimmedContent = replyContent.trim();

    if (!trimmedContent) {
      setMessage("답글 내용을 입력해주세요.");
      return;
    }

    if (trimmedContent.length < 2 || trimmedContent.length > 1000) {
      setMessage("답글은 2자 이상 1000자 이하로 입력해주세요.");
      return;
    }

    setSubmittingReplyParentId(parentId);

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: trimmedContent,
          parentId,
        }),
      });

      const data = (await response.json()) as CreateCommentResponse;

      if (!response.ok) {
        setMessage(data.message ?? "답글 작성에 실패했습니다.");
        return;
      }

      const createdReply = data.comment;

      if (!createdReply) {
        setMessage("답글 작성 응답이 올바르지 않습니다.");
        return;
      }

      setComments((currentComments) =>
        appendComment(currentComments, createdReply),
      );
      setReplyContent("");
      setReplyingToCommentId(null);
      onCommentCountChange?.(1);
    } catch {
      setMessage("답글 작성 요청 중 오류가 발생했습니다.");
    } finally {
      setSubmittingReplyParentId(null);
    }
  }

  function startEditComment(comment: CommentItem) {
    setMessage("");
    setReplyingToCommentId(null);
    setReplyContent("");
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  }

  function cancelEditComment() {
    setMessage("");
    setEditingCommentId(null);
    setEditingContent("");
  }

  function startReply(commentId: string) {
    setMessage("");
    setEditingCommentId(null);
    setEditingContent("");
    setReplyingToCommentId(commentId);
    setReplyContent("");
  }

  function cancelReply() {
    setMessage("");
    setReplyingToCommentId(null);
    setReplyContent("");
  }

  async function handleUpdateComment(commentId: string) {
    setMessage("");

    const trimmedContent = editingContent.trim();

    if (!trimmedContent) {
      setMessage("댓글 내용을 입력해주세요.");
      return;
    }

    if (trimmedContent.length < 2 || trimmedContent.length > 1000) {
      setMessage("댓글은 2자 이상 1000자 이하로 입력해주세요.");
      return;
    }

    setUpdatingCommentId(commentId);

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: trimmedContent,
        }),
      });

      const data = (await response.json()) as UpdateCommentResponse;

      if (!response.ok) {
        setMessage(data.message ?? "댓글 수정에 실패했습니다.");
        return;
      }

      const updatedComment = data.comment;

      if (!updatedComment) {
        setMessage("댓글 수정 응답이 올바르지 않습니다.");
        return;
      }

      setComments((currentComments) =>
        updateCommentInTree(currentComments, updatedComment),
      );

      setEditingCommentId(null);
      setEditingContent("");
    } catch {
      setMessage("댓글 수정 요청 중 오류가 발생했습니다.");
    } finally {
      setUpdatingCommentId(null);
    }
  }

  async function handleDeleteComment(commentId: string) {
    const confirmed = window.confirm("댓글을 삭제하시겠습니까?");

    if (!confirmed) {
      return;
    }

    setMessage("");
    setDeletingCommentId(commentId);

    try {
      const deleteCount = findDeleteCount(comments, commentId);

      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      const data = (await response.json()) as DeleteCommentResponse;

      if (!response.ok) {
        setMessage(data.message ?? "댓글 삭제에 실패했습니다.");
        return;
      }

      setComments((currentComments) =>
        removeCommentFromTree(currentComments, commentId),
      );

      onCommentCountChange?.(-deleteCount);

      // 일반 댓글을 삭제해서 현재 페이지가 비어버릴 수 있으므로 현재 페이지를 다시 조회한다.
      await fetchComments(currentPage);
    } catch {
      setMessage("댓글 삭제 요청 중 오류가 발생했습니다.");
    } finally {
      setDeletingCommentId(null);
    }
  }

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  return (
    <section className="mt-6 rounded border bg-white p-6">
      <h2 className="mb-1 text-xl font-bold">댓글</h2>

      <p className="mb-4 text-sm text-gray-500">
        일반 댓글 {totalRootCommentCount}개
      </p>

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
        <div className="space-y-4">
          {comments.map((comment) => {
            const isAuthor = currentUser?.id === comment.author.id;
            const isEditing = editingCommentId === comment.id;
            const isUpdating = updatingCommentId === comment.id;
            const isDeleting = deletingCommentId === comment.id;
            const isReplying = replyingToCommentId === comment.id;

            return (
              <article key={comment.id} className="rounded border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">
                      {comment.author.name}
                    </span>
                    <span> · {formatDate(comment.createdAt)}</span>
                  </div>

                  <div className="flex gap-2">
                    {currentUser && !isEditing && (
                      <button
                        type="button"
                        onClick={() => startReply(comment.id)}
                        className="text-sm text-blue-500"
                      >
                        답글
                      </button>
                    )}

                    {isAuthor && !isEditing && (
                      <>
                        <button
                          type="button"
                          onClick={() => startEditComment(comment)}
                          className="text-sm text-blue-500"
                        >
                          수정
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={isDeleting}
                          className="text-sm text-red-500 disabled:text-gray-400"
                        >
                          {isDeleting ? "삭제 중..." : "삭제"}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editingContent}
                      onChange={(event) =>
                        setEditingContent(event.target.value)
                      }
                      className="min-h-24 w-full resize-y rounded border px-3 py-2 text-sm"
                    />

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateComment(comment.id)}
                        disabled={isUpdating}
                        className="rounded bg-blue-500 px-3 py-1 text-sm text-white disabled:bg-gray-400"
                      >
                        {isUpdating ? "수정 중..." : "저장"}
                      </button>

                      <button
                        type="button"
                        onClick={cancelEditComment}
                        disabled={isUpdating}
                        className="rounded border px-3 py-1 text-sm disabled:text-gray-400"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap text-sm text-gray-800">
                    {comment.content}
                  </p>
                )}

                {isReplying && (
                  <div className="mt-4 rounded border bg-gray-50 p-3">
                    <label className="mb-1 block text-sm font-medium">
                      답글 작성
                    </label>

                    <textarea
                      value={replyContent}
                      onChange={(event) => setReplyContent(event.target.value)}
                      className="min-h-20 w-full resize-y rounded border bg-white px-3 py-2 text-sm"
                      placeholder="답글을 입력하세요"
                    />

                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleCreateReply(comment.id)}
                        disabled={submittingReplyParentId === comment.id}
                        className="rounded bg-blue-500 px-3 py-1 text-sm text-white disabled:bg-gray-400"
                      >
                        {submittingReplyParentId === comment.id
                          ? "작성 중..."
                          : "답글 작성"}
                      </button>

                      <button
                        type="button"
                        onClick={cancelReply}
                        disabled={submittingReplyParentId === comment.id}
                        className="rounded border bg-white px-3 py-1 text-sm disabled:text-gray-400"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                )}

                {comment.replies.length > 0 && (
                  <div className="mt-4 space-y-3 border-l pl-4">
                    {comment.replies.map((reply) => {
                      const isReplyAuthor = currentUser?.id === reply.author.id;
                      const isReplyEditing = editingCommentId === reply.id;
                      const isReplyUpdating = updatingCommentId === reply.id;
                      const isReplyDeleting = deletingCommentId === reply.id;

                      return (
                        <article key={reply.id} className="rounded border p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              <span className="font-medium text-gray-900">
                                {reply.author.name}
                              </span>
                              <span> · {formatDate(reply.createdAt)}</span>
                            </div>

                            {isReplyAuthor && !isReplyEditing && (
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEditComment(reply)}
                                  className="text-sm text-blue-500"
                                >
                                  수정
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteComment(reply.id)}
                                  disabled={isReplyDeleting}
                                  className="text-sm text-red-500 disabled:text-gray-400"
                                >
                                  {isReplyDeleting ? "삭제 중..." : "삭제"}
                                </button>
                              </div>
                            )}
                          </div>

                          {isReplyEditing ? (
                            <div className="space-y-2">
                              <textarea
                                value={editingContent}
                                onChange={(event) =>
                                  setEditingContent(event.target.value)
                                }
                                className="min-h-20 w-full resize-y rounded border px-3 py-2 text-sm"
                              />

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateComment(reply.id)}
                                  disabled={isReplyUpdating}
                                  className="rounded bg-blue-500 px-3 py-1 text-sm text-white disabled:bg-gray-400"
                                >
                                  {isReplyUpdating ? "수정 중..." : "저장"}
                                </button>

                                <button
                                  type="button"
                                  onClick={cancelEditComment}
                                  disabled={isReplyUpdating}
                                  className="rounded border px-3 py-1 text-sm disabled:text-gray-400"
                                >
                                  취소
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap text-sm text-gray-800">
                              {reply.content}
                            </p>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => fetchComments(currentPage - 1)}
            disabled={!hasPreviousPage || isLoading}
            className="rounded border px-3 py-2 text-sm disabled:text-gray-400"
          >
            이전
          </button>

          <span className="px-3 py-2 text-sm">
            {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() => fetchComments(currentPage + 1)}
            disabled={!hasNextPage || isLoading}
            className="rounded border px-3 py-2 text-sm disabled:text-gray-400"
          >
            다음
          </button>
        </div>
      )}
    </section>
  );
}
