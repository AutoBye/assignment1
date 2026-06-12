// 서 버 전 용 라 이 브 러 리
// 클라이언트 훅 들고오지마라
// 현재 로그인 사용자 가져오기
import "server-only";
import { toCurrentUser } from "@/lib/server/auth-user";
import { getSession } from "@/lib/server/session";
import type { CurrentUser } from "@/types/auth";

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getSession();

  if (!session) {
    return null;
  }

  return toCurrentUser(session.user);
}
