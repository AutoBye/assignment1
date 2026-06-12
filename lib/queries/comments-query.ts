import type { CommentPaginationResponse } from "@/types/api";
import type {
  CommentItem,
  CommentsResponse,
  CreateCommentResponse,
  DeleteCommentResponse,
  UpdateCommentResponse,
} from "@/types/comment";
import { apiClient } from "@/lib/api/client";

type FetchCommentsResult = {
  comments: CommentItem[];
  pagination: CommentPaginationResponse;
};

type CreateCommentRequestParams = {
  postId: string;
  content: string;
  parentId?: string;
};

type UpdateCommentRequestParams = {
  commentId: string;
  content: string;
};

/** 댓글 조회
 * <br> use comment 에서 분리됨
 * @param postId - string
 * @param page - number
 * */
export async function fetchComments(
  postId: string,
  page: number,
): Promise<FetchCommentsResult> {
  const data = await apiClient<CommentsResponse>(
    `/api/posts/${postId}/comments?page=${page}`,
    {
      method: "GET",
      errorMessage: "댓글 조회에 실패했습니다.",
    },
  );

  if (!data.comments || !data.pagination) {
    throw new Error("댓글 조회 응답이 올바르지 않습니다.");
  }

  return {
    comments: data.comments,
    pagination: data.pagination,
  };
}

/** 댓글 생성
 * <br> use comment 에서 분리됨
 * @param postId - string
 * @param content - string
 * @param parentId - string | undefined
 * */
export async function createCommentRequest({
  postId,
  content,
  parentId,
}: CreateCommentRequestParams) {
  const data = await apiClient<CreateCommentResponse>(
    `/api/posts/${postId}/comments`,
    {
      method: "POST",
      body: {
        content,
        parentId,
      },
      errorMessage: "댓글 작성에 실패했습니다.",
    },
  );

  if (!data.comment) {
    throw new Error("댓글 작성 응답이 올바르지 않습니다.");
  }

  return data.comment;
}

/** 댓글 수정
 * <br> use comment 에서 분리됨
 * @param postId - string
 * @param content - string
 * */
export async function updateCommentRequest({
  commentId,
  content,
}: UpdateCommentRequestParams) {
  const data = await apiClient<UpdateCommentResponse>(
    `/api/comments/${commentId}`,
    {
      method: "PATCH",
      body: {
        content,
      },
      errorMessage: "댓글 수정에 실패했습니다.",
    },
  );

  if (!data.comment) {
    throw new Error("댓글 수정 응답이 올바르지 않습니다.");
  }

  return data.comment;
}

/** 댓글 수정
 * <br> use comment 에서 분리됨
 * @param commentId - string
 * */
export async function deleteCommentRequest(commentId: string) {
  return apiClient<DeleteCommentResponse>(`/api/comments/${commentId}`, {
    method: "DELETE",
    errorMessage: "댓글 삭제에 실패했습니다.",
  });
}
