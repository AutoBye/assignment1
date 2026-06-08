//게시글 생성 API

import { NextResponse, NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// POST /api/posts
// -> 로그인 확인
// -> 제목, 내용 검사
// -> posts 테이블에 게시글 저장
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    // 로그인 확인
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

    // 제목, 내용 확인
    // ? 쓰는 이유. ? => 있을 수도 있고 없을 수도 있다.
    // 사용자가 직접 api를 호출하거나, 프론트 코드에 문제가 있으면 title 또는 컨텐츠만 혹은 빈 객체로 올 수 있따
    // -> 서버에서는 처음부터 title과 content가 무조건 있다고 믿으면 안된다.
    // 같은 처리 -> title : string | undefined;
    const body = (await request.json()) as {
      title?: string;
      content?: string;
    };

    //요청 body에 title/content가 없을 수도 있다고 가정한다.
    // 없으면 빈 문자열로 바꾼다.
    // 빈 문자열이면 400 에러를 반환한다.
    const title = body.title?.trim() ?? "";
    const content = body.content?.trim() ?? "";

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

    // 제목 길이 확인
    if (title.length < 2 || title.length > 200) {
      return NextResponse.json(
          {
            message: "제목은 2자 이상 200자 이하로 입력해주세요.",
          },
          {
            status: 400,
          },
      );
    }

    // 내용 길이 확인
    if (content.length < 2) {
      return NextResponse.json(
          {
            message: "내용은 2자 이상 입력해주세요.",
          },
          {
            status: 400,
          },
      );
    }

    // 글 생성
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
          message: "게시글이 작성되었습니다.",
          post,
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


// GET /api/posts
// -> 게시글 목록 조회
export async function GET() {
  try {

    // 여러개 조회. 최신순
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        author : {
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

    return NextResponse.json({
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
    })

  } catch (error) {
    console.log(error);

    return NextResponse.json(
        {
          message: "게시글 목록 조회 중 오류가 발생했습니다."
        },
        {
          status: 500,
        },
    );
  } finally {

  }
}
