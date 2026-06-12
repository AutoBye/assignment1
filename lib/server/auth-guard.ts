import "server-only";

import { getCurrentUser } from "@/lib/auth";
import { RouteError } from "@/lib/server/route-error";

export async function requireCurrentUser() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new RouteError("로그인이 필요합니다.", 401);
  }

  return currentUser;
}
