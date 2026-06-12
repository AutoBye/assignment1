import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  COMMENT_CONTENT_MAX_LENGTH,
  COMMENT_CONTENT_MIN_LENGTH,
  COMMENTS_PER_PAGE,
} from "@/lib/constants";
import { getErrorMessage } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";
import {
  createCommentRequest,
  deleteCommentRequest,
  fetchComments,
  updateCommentRequest,
} from "@/lib/requests/fetchComments";
import { useConfirmModalStore } from "@/lib/stores/confirm-modal-store";
import { useErrorModalStore } from "@/lib/stores/error-modal-store";
import { useToastStore } from "@/lib/stores/toast-store";
import type { CommentPaginationResponse } from "@/types/api";
import type { CommentItem } from "@/types/comment";

type UseCommentsParams = {
  postId: string;
  initialComments?: CommentItem[];
  initialPagination?: CommentPaginationResponse;
  onCommentCountChange?: (amount: number) => void;
};

type CommentFormState = {
  content: string;
  editingContent: string;
  replyContent: string;
};

type CommentStatusState = {
  message: string;
};

type CommentPaginationState = {
  currentPage: number;
};

type CommentTargetState = {
  deletingCommentId: string | null;
  editingCommentId: string | null;
  updatingCommentId: string | null;
  replyingToCommentId: string | null;
  submittingReplyParentId: string | null;
};

const DEFAULT_COMMENT_PAGINATION: CommentPaginationResponse = {
  currentPage: 1,
  totalPages: 1,
  totalRootCommentCount: 0,
  commentsPerPage: COMMENTS_PER_PAGE,
};

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

function getDeleteCount(comments: CommentItem[], commentId: string) {
  return comments.reduce((count, comment) => {
    if (comment.id === commentId) {
      return count + 1 + comment.replies.length;
    }

    const matchedReply = comment.replies.some(
      (reply) => reply.id === commentId,
    );

    return matchedReply ? count + 1 : count;
  }, 0);
}

export function useComments({
  postId,
  initialComments = [],
  initialPagination = DEFAULT_COMMENT_PAGINATION,
  onCommentCountChange,
}: UseCommentsParams) {
  const queryClient = useQueryClient();

  const openErrorModal = useErrorModalStore((state) => state.openErrorModal);
  const openConfirmModal = useConfirmModalStore(
    (state) => state.openConfirmModal,
  );
  const showToast = useToastStore((state) => state.showToast);

  const [formState, setFormState] = useState<CommentFormState>({
    content: "",
    editingContent: "",
    replyContent: "",
  });

  const [statusState, setStatusState] = useState<CommentStatusState>({
    message: "",
  });

  const [paginationState, setPaginationState] =
    useState<CommentPaginationState>({
      currentPage: initialPagination.currentPage,
    });

  const [targetState, setTargetState] = useState<CommentTargetState>({
    deletingCommentId: null,
    editingCommentId: null,
    updatingCommentId: null,
    replyingToCommentId: null,
    submittingReplyParentId: null,
  });

  const commentsQuery = useQuery({
    queryKey: queryKeys.comments.list(postId, paginationState.currentPage),
    queryFn: () => fetchComments(postId, paginationState.currentPage),
    initialData: {
      comments: initialComments,
      pagination: initialPagination,
    },
  });

  const comments = commentsQuery.data.comments;
  const pagination = commentsQuery.data.pagination;

  const createCommentMutation = useMutation({
    mutationFn: createCommentRequest,
    onError: (error) => {
      openErrorModal(
        getErrorMessage(error, "댓글 작성 요청 중 오류가 발생했습니다."),
      );
    },
  });

  const createReplyMutation = useMutation({
    mutationFn: createCommentRequest,
    onError: (error) => {
      openErrorModal(
        getErrorMessage(error, "답글 작성 요청 중 오류가 발생했습니다."),
      );
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: updateCommentRequest,
    onError: (error) => {
      openErrorModal(
        getErrorMessage(error, "댓글 수정 요청 중 오류가 발생했습니다."),
      );
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: deleteCommentRequest,
    onError: (error) => {
      openErrorModal(
        getErrorMessage(error, "댓글 삭제 요청 중 오류가 발생했습니다."),
      );
    },
  });

  function setContent(content: string) {
    setFormState((currentState) => ({
      ...currentState,
      content,
    }));
  }

  function setEditingContent(editingContent: string) {
    setFormState((currentState) => ({
      ...currentState,
      editingContent,
    }));
  }

  function setReplyContent(replyContent: string) {
    setFormState((currentState) => ({
      ...currentState,
      replyContent,
    }));
  }

  function clearMessage() {
    setStatusState({
      message: "",
    });
  }

  function setMessage(message: string) {
    setStatusState({
      message,
    });
  }

  function loadComments(page: number) {
    setPaginationState({
      currentPage: page,
    });
  }

  async function invalidateComments() {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.comments.post(postId),
    });
  }

  async function createComment() {
    clearMessage();

    const result = validateCommentContent(
      formState.content,
      "댓글 내용을 입력해주세요.",
    );

    if (result.message) {
      setMessage(result.message);
      return;
    }

    try {
      await createCommentMutation.mutateAsync({
        postId,
        content: result.content,
      });

      setContent("");
      onCommentCountChange?.(1);

      setPaginationState({
        currentPage: 1,
      });

      await invalidateComments();

      showToast({
        type: "success",
        message: "댓글이 작성되었습니다.",
      });
    } catch {
      // mutation onError에서 처리한다.
    }
  }

  async function createReply(parentId: string) {
    clearMessage();

    const result = validateCommentContent(
      formState.replyContent,
      "답글 내용을 입력해주세요.",
    );

    if (result.message) {
      setMessage(result.message);
      return;
    }

    setTargetState((currentState) => ({
      ...currentState,
      submittingReplyParentId: parentId,
    }));

    try {
      await createReplyMutation.mutateAsync({
        postId,
        content: result.content,
        parentId,
      });

      setFormState((currentState) => ({
        ...currentState,
        replyContent: "",
      }));

      setTargetState((currentState) => ({
        ...currentState,
        replyingToCommentId: null,
      }));

      onCommentCountChange?.(1);

      await invalidateComments();

      showToast({
        type: "success",
        message: "답글이 작성되었습니다.",
      });
    } catch {
      // mutation onError에서 처리한다.
    } finally {
      setTargetState((currentState) => ({
        ...currentState,
        submittingReplyParentId: null,
      }));
    }
  }

  function startEditComment(comment: CommentItem) {
    clearMessage();

    setTargetState((currentState) => ({
      ...currentState,
      replyingToCommentId: null,
      editingCommentId: comment.id,
    }));

    setFormState((currentState) => ({
      ...currentState,
      replyContent: "",
      editingContent: comment.content,
    }));
  }

  function cancelEditComment() {
    clearMessage();

    setTargetState((currentState) => ({
      ...currentState,
      editingCommentId: null,
    }));

    setFormState((currentState) => ({
      ...currentState,
      editingContent: "",
    }));
  }

  function startReply(commentId: string) {
    clearMessage();

    setTargetState((currentState) => ({
      ...currentState,
      editingCommentId: null,
      replyingToCommentId: commentId,
    }));

    setFormState((currentState) => ({
      ...currentState,
      editingContent: "",
      replyContent: "",
    }));
  }

  function cancelReply() {
    clearMessage();

    setTargetState((currentState) => ({
      ...currentState,
      replyingToCommentId: null,
    }));

    setFormState((currentState) => ({
      ...currentState,
      replyContent: "",
    }));
  }

  async function updateComment(commentId: string) {
    clearMessage();

    const result = validateCommentContent(
      formState.editingContent,
      "댓글 내용을 입력해주세요.",
    );

    if (result.message) {
      setMessage(result.message);
      return;
    }

    setTargetState((currentState) => ({
      ...currentState,
      updatingCommentId: commentId,
    }));

    try {
      await updateCommentMutation.mutateAsync({
        commentId,
        content: result.content,
      });

      setTargetState((currentState) => ({
        ...currentState,
        editingCommentId: null,
      }));

      setFormState((currentState) => ({
        ...currentState,
        editingContent: "",
      }));

      await invalidateComments();

      showToast({
        type: "success",
        message: "댓글이 수정되었습니다.",
      });
    } catch {
      // mutation onError에서 처리한다.
    } finally {
      setTargetState((currentState) => ({
        ...currentState,
        updatingCommentId: null,
      }));
    }
  }

  async function deleteComment(commentId: string) {
    const confirmed = await openConfirmModal({
      title: "댓글 삭제",
      message: "댓글을 삭제하시겠습니까?",
      confirmText: "삭제",
      cancelText: "취소",
    });

    if (!confirmed) {
      return;
    }

    clearMessage();

    setTargetState((currentState) => ({
      ...currentState,
      deletingCommentId: commentId,
    }));

    const deleteCount = getDeleteCount(comments, commentId);

    try {
      await deleteCommentMutation.mutateAsync(commentId);

      onCommentCountChange?.(-deleteCount);

      await invalidateComments();

      showToast({
        type: "success",
        message: "댓글이 삭제되었습니다.",
      });
    } catch {
      // mutation onError에서 처리한다.
    } finally {
      setTargetState((currentState) => ({
        ...currentState,
        deletingCommentId: null,
      }));
    }
  }

  return {
    comments,
    content: formState.content,
    setContent,
    message: statusState.message,
    isLoading: commentsQuery.isFetching,
    isSubmitting: createCommentMutation.isPending,
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    totalRootCommentCount: pagination.totalRootCommentCount,
    deletingCommentId: targetState.deletingCommentId,
    editingCommentId: targetState.editingCommentId,
    editingContent: formState.editingContent,
    setEditingContent,
    updatingCommentId: targetState.updatingCommentId,
    replyingToCommentId: targetState.replyingToCommentId,
    replyContent: formState.replyContent,
    setReplyContent,
    submittingReplyParentId: targetState.submittingReplyParentId,
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
