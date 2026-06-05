import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSessionToken, setSessionCookie } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";

    //빈 값 검사
    if (!email || !password) {
      return NextResponse.json(
        {
          message: "이메일과 비밀번호를 입력해주세요.",
        },
        {
          status: 400,
        },
      );
    }

    // 이메일로 유저 찾기
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // 유저 못찾으면
    if (!user) {
      return NextResponse.json(
        {
          message: "이메일 또는 비밀번호가 올바르지 않습니다.",
        },
        {
          status: 401,
        },
      );
    }

    // 비밀번호 검증
    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        {
          message: "이메일 또는 비밀번호가 올바르지 않습니다.",
        },
        {
          status: 401,
        },
      );
    }

    // 토큰 생성
    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json({
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

    return NextResponse.json(
      {
        message: "로그인 중 오류가 발생했습니다.",
      },
      {
        status: 500,
      },
    );
  }
}
