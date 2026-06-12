"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchCurrentUser,
  type CurrentUserResponse,
} from "@/lib/queries/auth-query";
import { queryKeys } from "@/lib/query-keys";
import type { CurrentUser } from "@/types/auth";

export const currentUserQueryKey = queryKeys.auth.currentUser;

export function useCurrentUserQuery(initialUser?: CurrentUser | null) {
  const initialData =
    initialUser === undefined
      ? undefined
      : ({
          user: initialUser,
        } satisfies CurrentUserResponse);

  return useQuery<CurrentUserResponse>({
    queryKey: currentUserQueryKey,
    queryFn: fetchCurrentUser,
    initialData,
    staleTime: 1000 * 60,
    retry: false,
  });
}
