import { useState } from "react";
import {
  COMMENT_CONTENT_MAX_LENGTH,
  COMMENT_CONTENT_MIN_LENGTH,
  COMMENTS_PER_PAGE,
} from "@/lib/constants";
import {
  appendComment,
  findDeleteCount,
  removeCommentFromTree,
  updateCommentInTree,
} from "@/lib/comment-tree";
import type { CommentPaginationResponse } from "@/types/api";
import type {
  CommentItem,
  CommentsResponse,
  CreateCommentResponse,
  DeleteCommentResponse,
  UpdateCommentResponse,
} from "@/types/comment";

type UseCommentsParams = {
  postId: string;
  initialComments?: CommentItem[];
  initialPagination?: CommentPaginationResponse;
  onCommentCountChange?: (amount: number) => void;
};

const DEFAULT_COMMENT_PAGINATION: CommentPaginationResponse = {
  currentPage: 1,
  totalPages: 1,
  totalRootCommentCount: 0,
  commentsPerPage: COMMENTS_PER_PAGE,
};

async function readJson<T>(response: Response) {
  try {
    return (await response.json()) as T;
  } catch {
    return undefined;
  }
}

function validateCommentContent(content: string, emptyMessage: string) {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    return {
      content: "",
      message: emptyMessage,
    };
  }

  if (
    trimmedContent.length < COMMENT_CONTENT_MIN_LENGTH ||
    trimmedContent.length > COMMENT_CONTENT_MAX_LENGTH
  ) {
    return {
      content: "",
      message: `댓글은 ${COMMENT_CONTENT_MIN_LENGTH}자 이상 ${COMMENT_CONTENT_MAX_LENGTH}자 이하로 입력해주세요.`,
    };
  }

  return {
    content: trimmedContent,
    message: "",
  };
}

export function useComments({
  postId,
  initialComments = [],
  initialPagination = DEFAULT_COMMENT_PAGINATION,
  onCommentCountChange,
}: UseCommentsParams) {
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentPage, setCurrentPage] = useState(initialPagination.currentPage);
  const [totalPages, setTotalPages] = useState(initialPagination.totalPages);
  const [totalRootCommentCount, setTotalRootCommentCount] = useState(
    initialPagination.totalRootCommentCount,
  );

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

  async function loadComments(page: number) {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/posts/${postId}/comments?page=${page}`,
        {
          method: "GET",
        },
      );

      const data = await readJson<CommentsResponse>(response);

      if (!response.ok) {
        setMessage(data?.message ?? "댓글 조회에 실패했습니다.");
        return;
      }

      setComments(data?.comments ?? []);

      if (data?.pagination) {
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

  async function createComment() {
    setMessage("");

    const result = validateCommentContent(content, "댓글 내용을 입력해주세요.");

    if (result.message) {
      setMessage(result.message);
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
          content: result.content,
        }),
      });

      const data = await readJson<CreateCommentResponse>(response);

      if (!response.ok) {
        setMessage(data?.message ?? "댓글 작성에 실패했습니다.");
        return;
      }

      if (!data?.comment) {
        setMessage("댓글 작성 응답이 올바르지 않습니다.");
        return;
      }

      setContent("");
      onCommentCountChange?.(1);

      await loadComments(1);
    } catch {
      setMessage("댓글 작성 요청 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function createReply(parentId: string) {
    setMessage("");

    const result = validateCommentContent(
      replyContent,
      "답글 내용을 입력해주세요.",
    );

    if (result.message) {
      setMessage(result.message);
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
          content: result.content,
          parentId,
        }),
      });

      const data = await readJson<CreateCommentResponse>(response);

      if (!response.ok) {
        setMessage(data?.message ?? "답글 작성에 실패했습니다.");
        return;
      }

      const createdReply = data?.comment;

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

  async function updateComment(commentId: string) {
    setMessage("");

    const result = validateCommentContent(
      editingContent,
      "댓글 내용을 입력해주세요.",
    );

    if (result.message) {
      setMessage(result.message);
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
          content: result.content,
        }),
      });

      const data = await readJson<UpdateCommentResponse>(response);

      if (!response.ok) {
        setMessage(data?.message ?? "댓글 수정에 실패했습니다.");
        return;
      }

      const updatedComment = data?.comment;

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

  async function deleteComment(commentId: string) {
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

      const data = await readJson<DeleteCommentResponse>(response);

      if (!response.ok) {
        setMessage(data?.message ?? "댓글 삭제에 실패했습니다.");
        return;
      }

      setComments((currentComments) =>
        removeCommentFromTree(currentComments, commentId),
      );

      onCommentCountChange?.(-deleteCount);

      await loadComments(currentPage);
    } catch {
      setMessage("댓글 삭제 요청 중 오류가 발생했습니다.");
    } finally {
      setDeletingCommentId(null);
    }
  }

  return {
    comments,
    content,
    setContent,
    message,
    isLoading,
    isSubmitting,
    currentPage,
    totalPages,
    totalRootCommentCount,
    deletingCommentId,
    editingCommentId,
    editingContent,
    setEditingContent,
    updatingCommentId,
    replyingToCommentId,
    replyContent,
    setReplyContent,
    submittingReplyParentId,
    loadComments,
    createComment,
    createReply,
    startEditComment,
    cancelEditComment,
    startReply,
    cancelReply,
    updateComment,
    deleteComment,
  };
}
