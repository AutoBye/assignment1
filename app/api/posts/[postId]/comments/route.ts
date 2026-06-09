import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonSuccess } from "@/lib/api-response";

import {
  COMMENT_CONTENT_MAX_LENGTH,
  COMMENT_CONTENT_MIN_LENGTH,
  COMMENTS_PER_PAGE,
} from "@/lib/constants";

import {
  getOptionalStringValue,
  getPositivePageNumber,
  getStringValue,
  isUUID,
} from "@/lib/validators";

export const runtime = "nodejs";

type CommentsRouteContext = {
  params: Promise<{
    postId: string;
  }>;
};

type CreateCommentRequestBody = {
  content?: unknown;
  parentId?: unknown;
};

// GET /api/posts/[postId]/comments
// -> 특정 게시글의 댓글 목록 조회
// -> 일반 댓글만 페이지네이션
// -> 대댓글은 해당 일반 댓글 아래에 함께 조회
// 06-09
// 라이브러리 / 타입
export async function GET(
  request: NextRequest,
  { params }: CommentsRouteContext,
) {
  try {
    const { postId } = await params;

    // 늘 있는 체크
    if (!isUUID(postId)) {
      return jsonError("올바르지 않은 게시글 ID입니다.", 400);
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
      return jsonError("게시글을 찾을 수 없습니다.", 404);
    }

    const { searchParams } = new URL(request.url);
    const requestedPage = getPositivePageNumber(searchParams.get("page"));

    // 대댓글 말고 일반 댓글 갯수 쿼리
    const totalRootCommentCount = await prisma.comment.count({
      where: {
        postId,
        parentId: null,
      },
    });

    //페이지 계산
    const totalPages = Math.max(
      1,
      Math.ceil(totalRootCommentCount / COMMENTS_PER_PAGE),
    );
    const currentPage = Math.min(requestedPage, totalPages);

    // 댓글 쿼리
    const comments = await prisma.comment.findMany({
      where: {
        postId,
        parentId: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (currentPage - 1) * COMMENTS_PER_PAGE,
      take: COMMENTS_PER_PAGE,
      select: {
        id: true,
        content: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        replies: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            content: true,
            parentId: true,
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
        },
      },
    });

    return jsonSuccess({
      comments: comments.map((comment) => ({
        ...comment,
        replies: comment.replies.map((reply) => ({
          ...reply,
          replies: [],
        })),
      })),
      pagination: {
        currentPage,
        totalPages,
        totalRootCommentCount,
        commentsPerPage: COMMENTS_PER_PAGE,
      },
    });
  } catch (error) {
    console.log(error);

    return jsonError("댓글 조회 중 오류가 발생했습니다", 500);
  } finally {
  }
}

// POST /api/posts/[postId]/comments
// -> 로그인 확인
// -> 게시글 존재 확인
// -> 댓글 내용 검사
// -> parentId가 있으면 대댓글로 생성
// -> parentId가 없으면 일반 댓글로 생성
export async function POST(
  request: NextRequest,
  { params }: CommentsRouteContext,
) {
  try {
    // 로그인 체크
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return jsonError("로그인이 필요합니다.", 401);
    }

    // UUID 체크
    const { postId } = await params;
    if (!isUUID(postId)) {
      return jsonError("올바르지 않은 게시글 ID입니다.", 400);
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
      return jsonError("게시글을 찾을 수 없습니다.", 404);
    }

    // 내용 검증
    const body = (await request.json()) as CreateCommentRequestBody;
    const content = getStringValue(body.content);
    const parentId = getOptionalStringValue(body.parentId);
    if (!content) {
      return jsonError("댓글 내용을 입력해주세요.", 400);
    }

    if (content.length < COMMENT_CONTENT_MIN_LENGTH  || content.length > COMMENT_CONTENT_MAX_LENGTH) {
      return jsonError(
        `댓글은 ${COMMENT_CONTENT_MIN_LENGTH}자 이상 ${COMMENT_CONTENT_MAX_LENGTH}자 이하로 입력해주세요.`,
        400,
      );
    }

    // 부모댓글관련 에러처리
    if (parentId) {
      if (!isUUID(parentId)) {
        return jsonError("올바르지 않은 부모 댓글 ID 입니다.", 400);
      }

      const parentComment = await prisma.comment.findUnique({
        where: {
          id: parentId,
        },
        select: {
          id: true,
          postId: true,
          parentId: true,
        },
      });

      if (!parentComment) {
        return jsonError("부모 댓글을 찾을 수 없습니다.", 404);
      }

      if (parentComment.postId !== postId) {
        return jsonError(
          "현재 게시글의 댓글에만 답글을 작성할 수 있습니다.",
          400,
        );
      }

      if (parentComment.parentId !== null) {
        return jsonError("대댓글에는 다시 답글을 작성할 수 없습니다.", 400);
      }
    }

    // 댓글 create
    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: currentUser.id,
        parentId,
      },
      select: {
        id: true,
        content: true,
        parentId: true,
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

    return jsonSuccess(
      {
        message: parentId ? "답글이 작성되었습니다." : "댓글이 작성되었습니다.",
        comment: {
          ...comment,
          replies: [],
        },
      },
      201,
    );
  } catch (error) {
    console.log(error);

    return jsonError("댓글 작성 중 오류가 발생했습니다.", 500);
  } finally {
  }
}
