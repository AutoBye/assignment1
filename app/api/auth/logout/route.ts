import { NextResponse } from "next/server";
import { clearSessionCookie, revokeCurrentSession } from "@/lib/server/session";

export const runtime = "nodejs";

// POST /api/auth/logout
// -> 쿠키 삭제
// -> 로그아웃 완료
// 지금은 form으로 action="/api/auth/logout" 이라 여기로 이동해서 JSON 화면이 보임
// 로그아웃 버튼을 클라이언트 컴포넌트로 만들고 fetch("/api/auth/logout") 후 router.push("/") 하기
export async function POST() {
  await revokeCurrentSession();

  const response = NextResponse.json({
    message: "로그아웃되었습니다.",
  });

  clearSessionCookie(response);

  return response;
}
