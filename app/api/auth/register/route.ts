import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { createSession, setSessionCookie } from "@/lib/session";

export const runtime = "nodejs";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    // 클라이언트 요청
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      name?: string;
    };

    // 이메일 앞뒤 공백 제거, 소문자
    const email = body.email?.trim().toLowerCase() ?? "";
    //그대로
    const password = body.password ?? "";
    //앞뒤 공백 제거
    const name = body.name?.trim() ?? "";

    // 입력값 검증
    if (!email || !password || !name) {
      return NextResponse.json(
        {
          message: "이메일, 비밀번호, 이름을 모두 입력해주세요.",
        },
        {
          status: 400,
        },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          message: "올바른 이메일 형식이 아닙니다.",
        },
        {
          status: 400,
        },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          message: "비밀번호는 8자 이상이어야 합니다.",
        },
        {
          status: 400,
        },
      );
    }

    if (name.length < 2 || name.length > 20) {
      return NextResponse.json(
        {
          message: "이름은 2자 이상 20자 이하로 입력해주세요.",
        },
        {
          status: 400,
        },
      );
    }



    // 이메일 중복 검색
    // 있으면 409 반환
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "이미 가입된 이메일입니다.",
        },
        {
          status: 409,
        },
      );
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

    //가입 성공 후 바로 로그인 상태를 만들기 위해 세션 생성
    const token = await createSession(user.id);

    const response = NextResponse.json(
      {
        message: "회원가입이 완료되었습니다.",
        user,
      },
      {
        status: 201,
      },
    );

    // 쿠키저장
    setSessionCookie(response, token);

    return response;
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "회원가입 중 오류가 발생했습니다.",
      },
      {
        status: 500,
      },
    );
  }
}
