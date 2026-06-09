import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonSuccess } from "@/lib/api-response";
import {
  POST_CONTENT_MIN_LENGTH,
  POST_TITLE_MAX_LENGTH,
  POST_TITLE_MIN_LENGTH,
} from "@/lib/constants";
import { getStringValue, isUUID } from "@/lib/validators";

export const runtime = "nodejs";

type PostDetailRouteContext = {
  params: Promise<{
    postId: string;
  }>;
};

type UpdatePostRequestBody = {
  title?: unknown;
  content?: unknown;
};

//GET /api/posts/[postId]
// 게시글 상세 조회
// 얘도 로그인 확인 필요한가? => ㅇㅇ 필요해짐. 사용자의 Like 여부 반환해야함

// 06-08
// 페이지네이션 적용
// 라이브러리 타입 적용
// _request -> 이 파라미터는 필요해서 받아두지만, 코드 안에서 사용하지는 않음.
export async function GET(
  _request: NextRequest,
  { params }: PostDetailRouteContext,
) {
  try {
    const { postId } = await params;

    if (!isUUID(postId)) {
      return jsonError("올바르지 않은 게시글 ID입니다.", 400);
    }

    const currentUser = await getCurrentUser();

    // 쿼리는 너무 반복되니까 넘어가
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
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
        _count: {
          select: {
            comments: true,
            likes: true,
            bookmarks: true,
          },
        },
      },
    });

    if (!post) {
      return jsonError("게시글을 찾을 수 없습니다.", 404);
    }

    // 현재 로그인한 유저의 좋아요 기록
    let likedByCurrentUser = false;
    if (currentUser) {
      const existingLike = await prisma.postLike.findUnique({
        where: {
          postId_userId: {
            postId,
            userId: currentUser.id,
          },
        },
        select: {
          postId: true,
        },
      });

      likedByCurrentUser = existingLike !== null;
    }

    return jsonSuccess({
      post: {
        id: post.id,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        author: post.author,
        commentCount: post._count.comments,
        likeCount: post._count.likes,
        bookmarkCount: post._count.bookmarks,
        likedByCurrentUser,
      },
    });
  } catch (error) {
    console.log(error);

    return jsonError("게시글 조회 중 오류가 발생했습니다.", 500);
  } finally {
  }
}

// PATCH /api/posts/[postId]
// -> 로그인 확인
// -> 게시글 존재 확인
// -> 작성자 본인인지 확인
// -> 제목, 내용 검사
// -> 게시글 수정
// 06-08
// 라이브러리 / 타입 적용
// 얘는 request body 씀
export async function PATCH(
  request: NextRequest,
  { params }: PostDetailRouteContext,
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return jsonError("로그인이 필요합니다.", 401);
    }

    const { postId } = await params;

    if (!isUUID(postId)) {
      return jsonError("올바르지 않은 게시글 ID입니다", 400);
    }

    const body = (await request.json()) as UpdatePostRequestBody;
    const title = getStringValue(body.title);
    const content = getStringValue(body.content);

    if (!title || !content) {
      return jsonError("제목 또는 내용을 입력해주세요.", 400);
    }

    if (
      title.length < POST_TITLE_MIN_LENGTH ||
      title.length > POST_TITLE_MAX_LENGTH
    ) {
      return jsonError(
        `제목은 ${POST_TITLE_MIN_LENGTH}자 이상 ${POST_TITLE_MAX_LENGTH}자 이하로 입력해주세요.`,
        400,
      );
    }

    if (content.length < POST_CONTENT_MIN_LENGTH) {
      return jsonError(
        `내용은 ${POST_CONTENT_MIN_LENGTH}자 이상 입력해주세요.`,
        400,
      );
    }

    // 게시글 조회 쿼리
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

    if (post.authorId !== currentUser.id) {
      return jsonError("게시글을 수정할 권한이 없습니다.", 403);
    }

    // 게시글 수정 쿼리
    const updatedPost = await prisma.post.update({
      where: {
        id: post.id,
      },
      data: {
        title,
        content,
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

    return jsonSuccess({
      message: "게시글이 수정되었습니다.",
      post: updatedPost,
    });
  } catch (error) {
    console.log(error);

    return jsonError("게시글 수정 중 오류가 발생했습니다.", 500);
  }
}

// DELETE /api/posts/[postId]
// -> 로그인 확인
// -> 게시글 존재 확인
// -> 작성자 본인인지 확인
// -> 게시글 삭제
// 06-08
// 라이브러리 / 타입 적용
// 얘는 request 안씀
export async function DELETE(
  _request: NextRequest,
  { params }: PostDetailRouteContext,
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return jsonError("로그인이 필요합니다.", 401);
    }

    const { postId } = await params;

    if (!isUUID(postId)) {
      return jsonError("올바르지 않은 게시글 ID입니다.", 400);
    }

    // 게시글 조회 쿼리
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
      return jsonError(" 게시글을 찾을 수 없습니다.", 404);
    }

    if (post.authorId !== currentUser.id) {
      return jsonError("게시글을 삭제할 권한이 없습니다.", 403);
    }

    // 게시글 삭제 쿼리
    await prisma.post.delete({
      where: {
        id: post.id,
      },
    });

    return jsonSuccess("게시글이 삭제되었습니다.", 200);
  } catch (error) {
    console.log(error);

    return jsonError("게시글 삭제 중 오류가 발생했습니다.", 500);
  } finally {
  }
}
