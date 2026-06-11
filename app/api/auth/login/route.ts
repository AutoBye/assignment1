import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSession, setSessionCookie } from "@/lib/session";
import { validateLoginInput } from "@/lib/auth-validation";
import { jsonError, jsonSuccess } from "@/lib/api-response";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = validateLoginInput(body);

    if (!validation.ok) {
      return jsonError(validation.message, validation.status);
    }

    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return jsonError("이메일 또는 비밀번호가 올바르지 않습니다.", 401);
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      return jsonError("이메일 또는 비밀번호가 올바르지 않습니다.", 401);
    }

    // 토큰 생성
    const token = await createSession(user.id);

    const response = jsonSuccess({
      message: "로그인되었습니다.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    });

    // 쿠키 저장
    setSessionCookie(response, token);

    return response;
  } catch (error) {
    console.error(error);

    return jsonError("로그인 중 오류가 발생했습니다.", 500);
  }
}
