import { apiClient } from "@/lib/api/client";
import type { CurrentUser } from "@/types/auth";
import type { BookmarkedPostsResponse } from "@/types/post";

export type ProfileUpdateResponse = {
  message?: string;
  user: CurrentUser;
};

export type PasswordChangeResponse = {
  message?: string;
};

export async function fetchBookmarkedPosts() {
  const data = await apiClient<BookmarkedPostsResponse>("/api/me/bookmarks", {
    method: "GET",
    errorMessage: "북마크 목록을 가져오지 못했습니다.",
  });

  return {
    posts: data.posts ?? [],
  };
}

export async function updateMyProfile(input: { name: string }) {
  const data = await apiClient<ProfileUpdateResponse>("/api/me/profile", {
    method: "PATCH",
    body: input,
    errorMessage: "프로필 수정에 실패했습니다.",
  });

  if (!data.user) {
    throw new Error("프로필 응답이 올바르지 않습니다.");
  }

  return {
    message: data.message ?? "프로필이 수정되었습니다.",
    user: data.user,
  };
}

export async function updateMyPassword(input: {
  currentPassword: string;
  newPassword: string;
}) {
  const data = await apiClient<PasswordChangeResponse>("/api/me/password", {
    method: "PATCH",
    body: input,
    errorMessage: "비밀번호 변경에 실패했습니다.",
  });

  return {
    message: data.message ?? "비밀번호가 변경되었습니다.",
  };
}
