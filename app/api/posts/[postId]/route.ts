import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

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

function isUUID(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function getStringValue(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

//GET /api/posts/[postId]
// -> UUID 체크
// -> postid로 게시글 찾음
// 얘도 로그인 확인 필요한가?
export async function GET(
  _request: NextRequest,
  { params }: PostDetailRouteContext,
) {
  try {
    const { postId } = await params;

    // UUID 체크
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

    // postid로 모든거 다 불러옴
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
      return NextResponse.json(
        {
          message: "게시글을 찾을 수 없습니다.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
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
      },
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "게시글을 찾을 수 없습니다.",
      },
      {
        status: 500,
      },
    );
  } finally {
  }
}

// DELETE /api/posts/[postId]
// -> 로그인 확인
// -> 게시글 존재 확인
// -> 작성자 본인인지 확인
// -> 게시글 삭제
export async function DELETE(
  _request: NextRequest,
  { params }: PostDetailRouteContext,
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          message: "올바르지 않은 게시글 ID입니다.",
        },
        {
          status: 400,
        },
      );
    }

    // 이건 뭘까요??
    const { postId } = await params;

    // UUID 체크
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

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        id: true,
        authorId: true,
      },
    });

    // 게시글 존재 체크
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

    // 권한 체크
    if (post.authorId !== currentUser.id) {
      return NextResponse.json(
        {
          message: "게시글을 삭제할 권한이 없습니다.",
        },
        {
          status: 403,
        },
      );
    }

    await prisma.post.delete({
      where: {
        id: post.id,
      },
    });

    return NextResponse.json({
      message: "게시글이 삭제되었습니다.",
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        message: "게시글 삭제 중 오류가 발생했습니다.",
      },
      {
        status: 500,
      },
    );
  } finally {
  }
}

// PATCH /api/posts/[postId]
// -> 로그인 확인
// -> 게시글 존재 확인
// -> 작성자 본인인지 확인
// -> 제목, 내용 검사
// -> 게시글 수정
export async function PATCH(
  _request: NextRequest,
  { params }: PostDetailRouteContext,
) {
  try {
    const currentUser = await getCurrentUser();

    // 세션확인
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

    // uuid 체크
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

    // 늘 있는 제목 내용 글자수 체크
    const body = (await _request.json()) as UpdatePostRequestBody;
    const title = getStringValue(body.title);
    const content = getStringValue(body.content);
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

    // 게시글 존재 여부
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

    // 권한 체크
    if (post.authorId !== currentUser.id) {
      return NextResponse.json(
        {
          message: "게시글을 수정할 권한이 없습니다.",
        },
        {
          status: 403,
        },
      );
    }

    // 업데이트 쿼리
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

    return NextResponse.json({
      message: "게시글이 수정되었습니다.",
      post: updatedPost,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        message: "게시글 수정 중 오류가 발생했습니다.",
      },
      {
        status: 500,
      },
    );
  } finally {
  }
}
