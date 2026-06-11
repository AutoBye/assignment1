import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { createSession, setSessionCookie } from "@/lib/session";
import { validateRegisterInput } from "@/lib/auth-validation";
import {jsonError, jsonSuccess} from "@/lib/api-response";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // 클라이언트 요청
    const body = await request.json();

    const validation = validateRegisterInput(body);

    if (!validation.ok) {
      return jsonError(validation.message, validation.status);
    }

    const { email, password, name } = validation.data;

    // 있으면 409 반환
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return jsonError("이미 가입된 이메일입니다.", 409);
    }

    //비밀번호 해쉬
    const passwordHash = await hashPassword(password);

    //사용자 생성
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // 가입 성공 후 바로 로그인 상태를 만들기 위해 세션 생성
    // 06-11 쿠키 -> 서버 세션방식
    const token = await createSession(user.id);

    const response = jsonSuccess(
      {
        message: "회원가입이 완료되었습니다.",
        user,
        status: 201,
      },
    );



    // 쿠키저장
    setSessionCookie(response, token);

    return response;
  } catch (error) {
    console.error(error);

    return jsonError("회원가입 중 오류가 발생했습니다.", 500);
  }
}
