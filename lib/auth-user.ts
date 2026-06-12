import "server-only";

import type { CurrentUser, ServerCurrentUser } from "@/types/auth";

export const CURRENT_USER_SELECT = {
  id: true,
  email: true,
  name: true,
  createdAt: true,
} as const;

export const CURRENT_USER_WITH_PASSWORD_SELECT = {
  ...CURRENT_USER_SELECT,
  passwordHash: true,
} as const;

export function toCurrentUser(user: ServerCurrentUser): CurrentUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
  };
}
