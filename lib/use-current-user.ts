"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCurrentUser } from "@/lib/queries/auth-query";
import { queryKeys } from "@/lib/query-keys";

export const currentUserQueryKey = queryKeys.auth.currentUser;

export function useCurrentUserQuery() {
	return useQuery({
		queryKey: queryKeys.auth.currentUser,
		queryFn: fetchCurrentUser,
		staleTime: 1000 * 60,
		retry: false,
	});
}



