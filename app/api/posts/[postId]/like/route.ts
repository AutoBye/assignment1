import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type LikeRouteContext = {
  params: Promise<{
    postId: string;
  }>;
};

function isUUID(value: unknown) {
  if (typeof value !== "string") {
    return false;
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

// POST /api/posts/[postId]/like
// -> 로그인 확인
// -> 게시글 존재 확인
// -> 좋아요가 없으면 생성
// -> 좋아요가 있으면 삭제
// -> 현재 좋아요 상태와 좋아요 수 반환
export async function POST(
  _request: NextRequest,
  { params }: LikeRouteContext,
) {
  try {
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

    const { postId } = await params;
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

    // 글 존재 확인
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        id: true,
        authorId: true,
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

    // 내 글엔 추천 불가능
    if (post.authorId === currentUser.id) {
      return NextResponse.json(
        {
          message: "자신이 작성한 글에는 좋아요를 누를 수 없습니다.",
        },
        {
          status: 403,
        },
      );
    }

    //좋아요 확인
    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: currentUser.id,
        },
      },
      select: {
        postId: true,
        userId: true,
      },
    });

    let liked: boolean;

    // 좋아요 있으면 취소, 없으면 좋아요. 토글
    if (existingLike) {
      await prisma.postLike.delete({
        where: {
          postId_userId: {
            postId,
            userId: currentUser.id,
          },
        },
      });

      liked = false;
    } else {
      await prisma.postLike.create({
        data: {
          postId,
          userId: currentUser.id,
        },
      });

      liked = true;
    }

    //좋아요 수
    const likeCount = await prisma.postLike.count({
      where: {
        postId,
      },
    });

    return NextResponse.json({
      message: liked ? "좋아요를 눌렀습니다." : "좋아요를 취소했습니다.",
      liked,
      likeCount,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "좋아요 처리 중 오류가 발생했습니다.",
      },
      {
        status: 500,
      },
    );
  }
}
