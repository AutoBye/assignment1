// 입력 검증 / 유저 조회 / 비밀번호 해쉬 검증 / 세션 생성 / 쿠키 설정/ 응답 반환
import { NextRequest } from "next/server";
import { createSession, setSessionCookie } from "@/lib/session";
import { jsonError, jsonUser } from "@/lib/api-response";
import { loginWithEmailPassword } from "@/lib/auth-service";
import { validateLoginInput } from "@/lib/validations/user";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 입력 검증
    const validation = validateLoginInput(body);

    if (!validation.ok) {
      return jsonError(validation.message, validation.status);
    }

    // 조회 / 검증
    const result = await loginWithEmailPassword(validation.data);

    if (!result.ok) {
      return jsonError(result.message, result.status);
    }

    // 토큰 생성
    const token = await createSession(result.user.id);

    // 응답
    const response = jsonUser("로그인되었습니다.", result.user);

    // 세션 쿠키 저장
    setSessionCookie(response, token);

    return response;
  } catch (error) {
    console.error(error);

    return jsonError("로그인 중 오류가 발생했습니다.", 500);
  }
}
