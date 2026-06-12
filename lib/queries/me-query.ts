import { BookmarkedPostsResponse } from "@/types/post";
import { CurrentUser } from "@/types/auth";

export type ProfileUpdateResponse = {
  message: string;
  user: CurrentUser;
};

export type PasswordChangeResponse = {
  message: string;
};

export async function fetchBookmarkedPosts() {
  const response = await fetch(`/api/me/bookmarks`, {
    method: "GET",
  });

  const data = (await response.json()) as BookmarkedPostsResponse;

  if (!response.ok) {
    throw new Error(data.message ?? "북마크 목록을 가져오지 못했습니다.");
  }

  return {
    posts: data.posts ?? [],
  };
}

export async function updateMyProfile(input: { name: string }) {
  const response = await fetch(`/api/me/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as ProfileUpdateResponse;

  if (!response.ok) {
    throw new Error(data.message ?? "북마크 목록을 가져오지 못했습니다.");
  }

  if (!data.user) {
    throw new Error("프로필 응답이 올바르지 않습니다.");
  }

  return data;
}

export async function updateMyPassword(input: {
  currentPassword: string;
  newPassword: string;
}) {
  const response = await fetch("/api/me/password", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as PasswordChangeResponse;

  if (!response.ok) {
    throw new Error(data.message ?? "비밀번호 변경에 실패했습니다.");
  }

  return data;
}
