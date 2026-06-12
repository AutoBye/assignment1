//PrismaClient 싱글톤 관리

// 개발 모드에서 저장할 때마다 서버 코드가 다시 로드
// -> PrismaClient가 계속 새로 만들어짐
// 그래서 globalThis 에 PrismaClient를 저장해서 사용

import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

//.env에 있는 DB 접속 주소 사용
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

// Node.js 서버 전체에서 공유되는 전역 객체. 여기에 prisma 저장하려고 타입 지정
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

//이미 만들어둔 PrismaClient가 있으면 그걸 사용
//없으면 새로 생성
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["query", "error", "warn"],
  });

//Dev 환경에서만 전역에 저장
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
