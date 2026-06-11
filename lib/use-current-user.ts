"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCurrentUser } from "@/lib/queries/auth-query";

export const currentUserQueryKey = ["auth", "currentUser"] as const;

export function useCurrentUserQuery() {
	return useQuery({
		queryKey: currentUserQueryKey,
		queryFn: fetchCurrentUser,
		staleTime: 1000 * 60,
		retry: false,
	});
}



