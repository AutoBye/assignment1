"use client";

import React, { createContext, useContext } from "react";
import type { CurrentUser } from "@/types/auth";

type CurrentUserContextValue = {
  currentUser: CurrentUser | null;
  isLoggedIn: boolean;
};

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

type CurrentUserProviderProps = {
  currentUser: CurrentUser | null;
  children: React.ReactNode;
};

export function CurrentUserProvider({
  currentUser,
  children,
}: CurrentUserProviderProps) {
  return (
    <CurrentUserContext.Provider
      value={{
        currentUser,
        isLoggedIn: currentUser !== null,
      }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const context = useContext(CurrentUserContext);

  if (!context) {
    throw new Error("useCurrentUser must be used inside CurrentUserProvider!");
  }

  return context;
}
