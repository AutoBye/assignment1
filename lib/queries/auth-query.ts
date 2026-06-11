import type { CurrentUser } from "@/types/auth";

export type CurrentUserResponse = {
	user: CurrentUser | null;
}

export async function fetchCurrentUser(): Promise<CurrentUserResponse> {
	const response = await fetch(`/api/auth/me`, {
		method: "GET",
		credentials: "include",
	});

	if (response.status === 401) {
		return {
			user: null,
		};
	}

	if (!response.ok) {
		throw new Error("현재 사용자 정보를 가져오지 못했습니다.");
	}

	return response.json();
}