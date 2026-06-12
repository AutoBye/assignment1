import type { CurrentUser } from "@/types/auth";
import { apiClient, ApiClientError } from "@/lib/api/client";

export type CurrentUserResponse = {
  message?: string;
  user: CurrentUser | null;
};

export type AuthUserResponse = {
  message?: string;
  user: CurrentUser;
};

export type LoginRequestInput = {
  email: string;
  password: string;
};

export type RegisterRequestInput = {
  email: string;
  name: string;
  password: string;
};

export type LogoutResponse = {
  message?: string;
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

export async function loginRequest(input: LoginRequestInput) {
  const data = await apiClient<AuthUserResponse>(`/api/auth/login`, {
    method: "POST",
    body: input,
    errorMessage: "로그인에 실패했습니다.",
  });

  if (!data.user) {
    throw new Error("로그인 응답이 올바르지 않습니다.");
  }

  return {
    message: data.message ?? "로그인되었습니다.",
    user: data.user,
  };
}

export async function registerRequest(input: RegisterRequestInput) {
  const data = await apiClient<AuthUserResponse>(`/api/auth/register`, {
    method: "POST",
    body: input,
    errorMessage: "회원가입에 실패했습니다.",
  });

  if (!data.user) {
    throw new Error("회원가입 응답이 올바르지 않습니다.");
  }

  return {
    message: data.message ?? "회원가입이 완료되었습니다.",
    user: data.user,
  };
}

export async function logoutRequest() {
  const data = await apiClient<LogoutResponse>(`/api/auth/logout`, {
    method: "POST",
    errorMessage: "로그아웃에 실패했습니다.",
  });

  return {
    message: data.message ?? "로그아웃되었습니다.",
  };
}
