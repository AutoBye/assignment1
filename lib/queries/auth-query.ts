import type { CurrentUser } from "@/types/auth";
import { apiClient, ApiClientError } from "@/lib/api/client";

export type CurrentUserResponse = {
  message?: string;
  user: CurrentUser | null;
};

export async function fetchCurrentUser(): Promise<CurrentUserResponse> {
  try {
    return await apiClient<CurrentUserResponse>(`/api/auth/me`, {
      method: "GET",
      errorMessage: "현재 사용자 정보를 가져오지 못했습니다.",
    });
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) {
      return {
        user: null,
      };
    }
    throw error;
  }
}
