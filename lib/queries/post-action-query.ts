import type { BookmarkButtonResponse, LikeButtonResponse } from "@/types/post";

export async function togglePostLike(postId: string) {
  const response = await fetch(`/api/posts/${postId}/like`, {
    method: "POST",
  });

  const data = (await response.json()) as LikeButtonResponse;

  if (!response.ok) {
    throw new Error(data.message ?? "좋아요 처리에 실패했습니다.");
  }

  if (typeof data.liked !== "boolean" || typeof data.likeCount !== "number") {
    throw new Error("좋아요 응답이 올바르지 않습니다.");
  }

  return {
    liked: data.liked,
    likeCount: data.likeCount,
    message: data.message,
  };
}

export async function togglePostBookmark(postId: string) {
  const response = await fetch(`/api/posts/${postId}/bookmark`, {
    method: "POST",
  });

  const data = (await response.json()) as BookmarkButtonResponse;

  if (!response.ok) {
    throw new Error(data.message ?? "북마크 처리에 실패했습니다.");
  }

  if (
    typeof data.bookmarked !== "boolean" ||
    typeof data.bookmarkCount !== "number"
  ) {
    throw new Error("북마크 응답이 올바르지 않습니다.");
  }

  return {
    bookmarked: data.bookmarked,
    bookmarkCount: data.bookmarkCount,
    message: data.message,
  };
}
