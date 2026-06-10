import { useState } from "react";
import {
  COMMENT_CONTENT_MAX_LENGTH,
  COMMENT_CONTENT_MIN_LENGTH,
  COMMENTS_PER_PAGE,
} from "@/lib/constants";
import type { CommentPaginationResponse } from "@/types/api";
import type {
  CommentItem,
  CreateCommentResponse,
  DeleteCommentResponse,
  UpdateCommentResponse,
} from "@/types/comment";
import { useErrorModalStore } from "@/lib/stores/error-modal-store";
import { useConfirmModalStore } from "@/lib/stores/confirm-modal-store";
import { useToastStore } from "@/lib/stores/toast-store";
import {useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchComments } from "@/lib/queries/comments-query";

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
  isSubmitting: boolean;
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

// - Hook 호출은 조건문 밖
// - UI 조건 분기는 JSX 안
// - 이벤트 함수 안에서 useState, useEffect 호출 금지
// - map 안에서 Hook 호출 금지
export function useComments({
  postId,
  initialComments = [],
  initialPagination = DEFAULT_COMMENT_PAGINATION,
  onCommentCountChange,
}: UseCommentsParams) {
  const queryClient = useQueryClient();

  //얘도 훅이다? 조건문 안이 아닌 state들과 같이 호출해
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
    isSubmitting: false,
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
    queryKey: ["comments", postId, paginationState.currentPage],
    queryFn: () => fetchComments(postId, paginationState.currentPage),
    initialData: {
      comments: initialComments,
      pagination: initialPagination,
    },
  });

  const comments = commentsQuery.data.comments;
  const pagination = commentsQuery.data.pagination;

  const setContent = (content: string) => {
    setFormState((currentState) => ({
      ...currentState,
      content,
    }));
  };

  const setEditingContent = (editingContent: string) => {
    setFormState((currentState) => ({
      ...currentState,
      editingContent,
    }));
  };

  const setReplyContent = (replyContent: string) => {
    setFormState((currentState) => ({
      ...currentState,
      replyContent,
    }));
  };

  function loadComments(page: number) {
    setPaginationState({
      currentPage: page,
    });
  }

  async function invalidateComments() {
    await queryClient.invalidateQueries({
      queryKey: ["comments", postId],
    });
  }

  async function createComment() {
    setStatusState((currentState) => ({
      ...currentState,
      message: "",
    }));

    const result = validateCommentContent(
      formState.content,
      "댓글 내용을 입력해주세요.",
    );

    if (result.message) {
      setStatusState((currentState) => ({
        ...currentState,
        message: result.message,
      }));
      return;
    }

    setStatusState((currentState) => ({
      ...currentState,
      isSubmitting: true,
    }));

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
        openErrorModal(data?.message ?? "댓글 작성에 실패했습니다.");
        return;
      }

      if (!data?.comment) {
        openErrorModal("댓글 작성 응답이 올바르지 않습니다.");
        return;
      }

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
      openErrorModal("댓글 작성 요청 중 오류가 발생했습니다.");
    } finally {
      setStatusState((currentState) => ({
        ...currentState,
        isSubmitting: false,
      }));
    }
  }

  async function createReply(parentId: string) {
    setStatusState((currentState) => ({
      ...currentState,
      message: "",
    }));

    const result = validateCommentContent(
      formState.replyContent,
      "답글 내용을 입력해주세요.",
    );

    if (result.message) {
      setStatusState((currentState) => ({
        ...currentState,
        message: result.message,
      }));
      return;
    }

    setTargetState((currentState) => ({
      ...currentState,
      submittingReplyParentId: parentId,
    }));

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
        openErrorModal(data?.message ?? "답글 작성에 실패했습니다.");
        return;
      }

      const createdReply = data?.comment;

      if (!createdReply) {
        openErrorModal("답글 작성 응답이 올바르지 않습니다.");
        return;
      }

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
      openErrorModal("답글 작성 요청 중 오류가 발생했습니다.");
    } finally {
      setTargetState((currentState) => ({
        ...currentState,
        submittingReplyParentId: null,
      }));
    }
  }

  function startEditComment(comment: CommentItem) {

    setStatusState((currentState) => ({
      ...currentState,
      message: "",
    }));

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

    setStatusState((currentState) => ({
      ...currentState,
      message: "",
    }));

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

    setStatusState((currentState) => ({
      ...currentState,
      message: "",
    }));

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

    setStatusState((currentState) => ({
      ...currentState,
      message: "",
    }));

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
    setStatusState((currentState) => ({
      ...currentState,
      message: "",
    }));

    const result = validateCommentContent(
      formState.editingContent,
      "댓글 내용을 입력해주세요.",
    );

    if (result.message) {
      setStatusState((currentState) => ({
        ...currentState,
        message: result.message,
      }));
      return;
    }

    setTargetState((currentState) => ({
      ...currentState,
      updatingCommentId: commentId,
    }));

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
        openErrorModal(data?.message ?? "댓글 수정에 실패했습니다.");
        return;
      }

      if (!data?.comment) {
        openErrorModal("댓글 수정 응답이 올바르지 않습니다.");
        return;
      }


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
      openErrorModal("댓글 수정 요청 중 오류가 발생했습니다.");
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

    setStatusState((currentState) => ({
      ...currentState,
      message: "",
    }));

    setTargetState((currentState) => ({
      ...currentState,
      deletingCommentId: commentId,
    }));

    try {
      const deleteCount = comments.reduce((count, comment) => {
        if (comment.id === commentId) {
          return count + 1 + comment.replies.length;
        }

        const matchedReply = comment.replies.some(
            (reply) => reply.id === commentId,
        );

        return matchedReply ? count + 1 : count;
      }, 0);

      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      const data = await readJson<DeleteCommentResponse>(response);

      if (!response.ok) {
        openErrorModal(data?.message ?? "댓글 삭제에 실패했습니다.");
        return;
      }

      onCommentCountChange?.(-deleteCount);

      await invalidateComments();

      showToast({
        type: "success",
        message: "댓글이 삭제되었습니다.",
      });
    } catch {
      openErrorModal("댓글 삭제 요청 중 오류가 발생했습니다.");
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
    isSubmitting: statusState.isSubmitting,
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
