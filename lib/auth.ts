// 서 버 전 용 라 이 브 러 리
// 클라이언트 훅 들고오지마라
import "server-only";
import { getSession } from "@/lib/session";

export async function getCurrentUser() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  return session.user;
}