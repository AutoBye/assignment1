import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {router} from "next/client";

export const runtime = "nodejs";

type createPostRequestBody = {
  title?: unknown;
  content?: unknown;
};

function getStringValue(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

// POST /api/posts
// -> 로그인 확인
// -> 제목, 내용 검사
// -> posts 테이블에 게시글 저장

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    // 로그인 했을때만 api에서 요청 가능
    if (!currentUser) {
      return NextResponse.json(
        {
          message: "로그인이 필요합니다.",
        },
        {
          status: 401,
        },
      );
    }

    const body = (await request.json()) as createPostRequestBody;
    const title = getStringValue(body.title);
    const content = getStringValue(body.content);

    // 제목, 내용 검사
    if (!title || !content) {
      return NextResponse.json(
        {
          message: "제목과 내용을 모두 입력해주세요.",
        },
        {
          status: 400,
        },
      );
    }

    if (content.length < 2) {
      return NextResponse.json(
        {
          message: "내용은 5자 이상 입력해주세요.",
        },
        {
          status: 400,
        },
      );
    }

    // 검사 후 글 생성
    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: currentUser.id,
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // TODO - post 페이지로
    router.replace("/");

    return NextResponse.json(
      {
        message: "게시글이 작성되었습니다.",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        message: "게시글 작성 중 오류가 발생했습니다.",
      },
      {
        status: 500,
      },
    );
  } finally {
  }
}
