import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonSuccess } from "@/lib/api-response";
import { isUUID } from "@/lib/validators";

export const runtime = "nodejs";

type LikeRouteContext = {
  params: Promise<{
    postId: string;
  }>;
};

// POST /api/posts/[postId]/like
// -> 로그인 확인
// -> 게시글 존재 확인
// -> 좋아요가 없으면 생성
// -> 좋아요가 있으면 삭제
// -> 현재 좋아요 상태와 좋아요 수 반환
// 06-09
// 라이브러리 / 타입 적용
export async function POST(
  _request: NextRequest,
  { params }: LikeRouteContext,
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return jsonError("로그인이 필요합니다.", 401);
    }

    const { postId } = await params;

    console.log(isUUID(postId));

    if (!isUUID(postId)) {
      return jsonError("올바르지 않은 게시글 ID입니다.", 400);
    }

    //게시글 조회 쿼리
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
      return jsonError("게시글을 찾을 수 없습니다.", 404);
    }

    if (post.authorId === currentUser.id) {
      return jsonError("자신이 작성한 글에는 좋아요를 누를 수 없습니다.", 403);
    }

    // 좋아요 했는지 조회 쿼리
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

    const likeCount = await prisma.postLike.count({
      where: {
        postId,
      },
    });

    return jsonSuccess({
      message: liked ? "좋아요를 눌렀습니다." : "좋아요를 취소했습니다.",
      liked,
      likeCount,
    });
  } catch (error) {
    console.log(error);

    return jsonError("좋아요 처리 중 오류가 발생했습니다.", 500);
  } finally {
  }
}
