import { apiClient } from "@/lib/api/client";
import type {
  BookmarkButtonResponse,
  CreatePostResponse,
  DeletePostResponse,
  LikeButtonResponse,
  PostDetail,
  PostDetailResponse,
  UpdatePostResponse,
} from "@/types/post";

export type PostFormInput = {
  title: string;
  content: string;
};

export async function fetchPostDetailRequest(
  postId: string,
  signal?: AbortSignal,
): Promise<PostDetail> {
  const data = await apiClient<PostDetailResponse>(`/api/posts/${postId}`, {
    method: "GET",
    signal,
    errorMessage: "게시글 조회에 실패했습니다.",
  });

  if (!data.post) {
    throw new Error("게시글 조회 응답이 올바르지 않습니다.");
  }

  return data.post;
}

export async function createPostRequest(input: PostFormInput) {
  const data = await apiClient<CreatePostResponse>(`/api/posts`, {
    method: "POST",
    body: input,
    errorMessage: "게시글 작성에 실패했습니다.",
  });

  if (!data.post) {
    throw new Error("게시글 작성 응답이 올바르지 않습니다.");
  }

  return {
    message: data.message ?? "게시글이 작성되었습니다.",
    post: data.post,
  };
}

export async function updatePostRequest(postId: string, input: PostFormInput) {
  const data = await apiClient<UpdatePostResponse>(`/api/posts/${postId}`, {
    method: "PATCH",
    body: input,
    errorMessage: "게시글 수정에 실패했습니다.",
  });

  if (!data.post) {
    throw new Error("게시글 수정 응답이 올바르지 않습니다.");
  }

  return {
    message: data.message ?? "게시글이 수정되었습니다.",
    post: data.post,
  };
}

export async function deletePostRequest(postId: string) {
  const data = await apiClient<DeletePostResponse>(`/api/posts/${postId}`, {
    method: "DELETE",
    errorMessage: "게시글 삭제에 실패했습니다.",
  });

  return {
    message: data.message ?? "게시글이 삭제되었습니다.",
  };
}

export async function togglePostLikeRequest(postId: string) {
  const data = await apiClient<LikeButtonResponse>(
    `/api/posts/${postId}/like`,
    {
      method: "POST",
      errorMessage: "좋아요 처리에 실패했습니다.",
    },
  );

  if (typeof data.liked !== "boolean" || typeof data.likeCount !== "number") {
    throw new Error("좋아요 응답이 올바르지 않습니다.");
  }

  return {
    message: data.message ?? "",
    liked: data.liked,
    likeCount: data.likeCount,
  };
}

export async function togglePostBookmarkRequest(postId: string) {
  const data = await apiClient<BookmarkButtonResponse>(
    `/api/posts/${postId}/bookmark`,
    {
      method: "POST",
      errorMessage: "북마크 처리에 실패했습니다.",
    },
  );

  if (
    typeof data.bookmarked !== "boolean" ||
    typeof data.bookmarkCount !== "number"
  ) {
    throw new Error("북마크 응답이 올바르지 않습니다.");
  }

  return {
    message: data.message ?? "",
    bookmarked: data.bookmarked,
    bookmarkCount: data.bookmarkCount,
  };
}
