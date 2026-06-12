// 입력 검증 / 이메일 중복 확인 / 비밀번호 해쉬 / 유저 생성 / 세션 생성 / 쿠키 설정 / 응답 반환
import { NextRequest } from "next/server";
import { createSession, setSessionCookie } from "@/lib/server/session";
import { jsonError, jsonUser } from "@/lib/server/api-response";
import { registerWithEmailPassword } from "@/lib/server/auth-service";
import { validateRegisterInput } from "@/lib/validations/user";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // 클라이언트 요청
    const body = await request.json();

    const validation = validateRegisterInput(body);

    if (!validation.ok) {
      return jsonError(validation.message, validation.status);
    }

    const result = await registerWithEmailPassword(validation.data);

    if (!result.ok) {
      return jsonError(result.message, result.status);
    }

    // 가입 성공 후 바로 로그인 상태를 만들기 위해 세션 생성
    // 06-11 쿠키 -> 서버 세션방식
    const token = await createSession(result.user.id);

    const response = jsonUser("회원가입이 완료되었습니다.", result.user, 201);
    setSessionCookie(response, token);

    return response;
  } catch (error) {
    console.error(error);

    return jsonError("회원가입 중 오류가 발생했습니다.", 500);
  }
}
