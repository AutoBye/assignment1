//게시글 생성 API

import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { getPositivePageNumber, getStringValue } from "@/lib/validators";

import {
  POST_CONTENT_MIN_LENGTH,
  POST_TITLE_MAX_LENGTH,
  POST_TITLE_MIN_LENGTH,
  POSTS_PER_PAGE,
} from "@/lib/constants";

export const runtime = "nodejs";

type CreatePostRequestBody = {
  title?: unknown;
  content?: string;
};

// GET /api/posts
// 06-05
// -> 게시글 목록 조회 API
// -> 로그인 확인
// -> 제목, 내용 검사
// -> posts 테이블에 게시글 저장
// 06-08
//GET /api/posts?page=1
// 페이지네이션 적용
// 라이브러리 타입 적용
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestPage = getPositivePageNumber(searchParams.get("page"));

    const totalPostCount = await prisma.post.count();
    const totalPages = Math.max(1, Math.ceil(totalPostCount / POSTS_PER_PAGE));
    const currentPage = Math.min(requestPage, totalPages);

    const posts = await prisma.post.findMany({
      skip: (currentPage - 1) * POSTS_PER_PAGE,
      take: POSTS_PER_PAGE,
      orderBy: {
        createdAt: "desc",
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

    return jsonSuccess({
      posts: posts.map((post) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        author: post.author,
        commentCount: post._count.comments,
        likeCount: post._count.likes,
        bookmarkCount: post._count.bookmarks,
      })),
      pagination: {
        currentPage,
        totalPages,
        totalPostCount,
        postsPerPage: POSTS_PER_PAGE,
      },
    });
  } catch (error) {
    console.log(error);

    return jsonError("게시글 목록 조회 중 오류가 발생했습니다.", 500);
  } finally {
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return jsonError("로그인이 필요합니다.", 401);
    }

    const body = (await request.json()) as CreatePostRequestBody;
    const title = getStringValue(body.title);
    const content = getStringValue(body.content);

    if (!title || !content) {
      return jsonError("제목과 내용을 모두 입력해주세요.", 400);
    }

    if (title.length < POST_TITLE_MIN_LENGTH || title.length > POST_TITLE_MAX_LENGTH) {
      return jsonError(`제목은 ${POST_TITLE_MIN_LENGTH}자 이상 ${POST_TITLE_MAX_LENGTH}자 이하로 입력해주세요.`, 400);
    }

    if (content.length < POST_CONTENT_MIN_LENGTH) {
      return jsonError(`내용은 ${POST_CONTENT_MIN_LENGTH}자 이상 입력해주세요.`, 400);
    }

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

    return jsonSuccess(
        {
          message: "게시글이 작성되었습니다.",
          post
        },
        201
    );
  } catch (error) {
    console.log(error);

    return jsonError("게시글 작성 중 오류가 발생했습니다.", 500);
  }
}
