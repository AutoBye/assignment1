"use client";

import { CurrentUser } from "@/types/auth";
import { ReactNode } from "react";
import { useCurrentUserQuery } from "@/lib/hooks/use-current-user-query";

type CurrentUserProviderProps = {
  currentUser: CurrentUser | null;
  children: ReactNode;
};

export function CurrentUserProvider({
  currentUser,
  children,
}: CurrentUserProviderProps) {
  useCurrentUserQuery(currentUser);

  return <>{children}</>;
}

export function useCurrentUser(initialUser?: CurrentUser | null) {
  const query = useCurrentUserQuery(initialUser);
  const currentUser = query.data?.user ?? null;

  return {
    ...query,
    currentUser,
    isLoggedIn: currentUser !== null,
  };
}
