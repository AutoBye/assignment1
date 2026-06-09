// 서 버 전 용 라 이 브 러 리
// 클라이언트 훅 들고오지마라
import "server-only";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function getCurrentUser() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  // 비밀번호 해쉬값은 가져오지 말자
  return prisma.user.findUnique({
    where: {
      id: session.userId,
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });
}