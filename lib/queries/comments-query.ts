import type { CommentPaginationResponse } from "@/types/api";
import type {
  CommentItem,
  CommentsResponse,
  CreateCommentResponse,
  DeleteCommentResponse,
  UpdateCommentResponse,
} from "@/types/comment";

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
export async function fetchComments(postId: string, page: number) : Promise<FetchCommentsResult> {
  const response = await fetch(`/api/posts/${postId}/comments?page=${page}`, {
    method: "GET",
  });

  const data = (await response.json()) as CommentsResponse;

  if (!response.ok) {
    throw new Error(data.message ?? "댓글 조회에 실패했습니다.");
  }

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
 * @param parentId - string
 * */
export async function createCommentRequest({
  postId,
  content,
  parentId,
}: CreateCommentRequestParams) {
  const response = await fetch(`/api/posts/${postId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content,
      parentId,
    }),
  });

  const data = (await response.json()) as CreateCommentResponse;

  if (!response.ok) {
    throw new Error(data.message ?? "댓글 작성에 실패했습니다.");
  }

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
  const response = await fetch(`/api/comments/${commentId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content,
    }),
  });

  const data = (await response.json()) as UpdateCommentResponse;

  if (!response.ok) {
    throw new Error(data.message ?? "댓글 수정에 실패했습니다.");
  }

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
  const response = await fetch(`/api/comments/${commentId}`, {
    method: "DELETE",
  });

  const data = (await response.json()) as DeleteCommentResponse;

  if (!response.ok) {
    throw new Error(data.message ?? "댓글 삭제에 실패했습니다.");
  }

  return data;
}
