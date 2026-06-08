import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type CommentsRouteContext = {
  params: Promise<{
    postId: string;
  }>;
};

type CreateCommentRequestBody = {
  content?: unknown;
};

function isUUID(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i.test(
    value,
  );
}

function getStringValue(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

// GET /api/posts/[postId]/comments
// -> 특정 게시글의 댓글 목록 조회
export async function GET(
  _request: NextRequest,
  { params }: CommentsRouteContext,
) {
  try {
    const { postId } = await params;

    // 늘 있는 체크
    if (!isUUID(postId)) {
      return NextResponse.json(
        {
          message: "올바르지 않은 게시글 ID입니다.",
        },
        {
          status: 400,
        },
      );
    }

    // 게시글 체크
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        id: true,
      },
    });
    if (!post) {
      return NextResponse.json(
        {
          message: "게시글을 찾을 수 없습니다.",
        },
        {
          status: 404,
        },
      );
    }

    // 댓글 쿼리
    const comments = await prisma.comment.findMany({
      where: {
        postId,
        parentId: null,
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
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

    return NextResponse.json({
      comments,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        message: "댓글 조회 중 오류가 발생했습니다.",
      },
      {
        status: 500,
      },
    );
  } finally {
  }
}

// POST /api/posts/[postId]/comments
// -> 로그인 확인
// -> 게시글 존재 확인
// -> 댓글 내용 검사
// -> 댓글 생성
export async function POST(
  request: NextRequest,
  { params }: CommentsRouteContext,
) {
  try {
    // 로그인 체크
    const currentUser = await getCurrentUser();
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

    // UUID 체크
    const { postId } = await params;
    if (!isUUID(postId)) {
      return NextResponse.json(
        {
          message: "올바르지 않은 게시글 ID 입니다.",
        },
        {
          status: 400,
        },
      );
    }

    // 게시글 존재 여부
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        id: true,
      },
    });
    if (!post) {
      return NextResponse.json(
        {
          message: "게시글을 찾을 수 없습니다.",
        },
        {
          status: 404,
        },
      );
    }

    // 내용 검증
    const body = (await request.json()) as CreateCommentRequestBody;
    const content = getStringValue(body.content);
    if (!content) {
      return NextResponse.json(
        {
          message: "댓글 내용을 입력해주세요.",
        },
        {
          status: 400,
        },
      );
    }
    if (content.length < 2 || content.length > 1000) {
      return NextResponse.json(
        {
          message: "댓글은 2자 이상 1000자 이하로 입력해주세요.",
        },
        {
          status: 400,
        },
      );
    }

    // 댓글 create
    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: currentUser.id,
      },
      select: {
        id: true,
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

    return NextResponse.json(
      {
        message: "댓글이 작성되었습니다.",
        comment,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "댓글 작성 중 오류가 발생했습니다.",
      },
      {
        status: 500,
      },
    );
  } finally {
  }
}
