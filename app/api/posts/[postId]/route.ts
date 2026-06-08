import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type PostDetailRouteContext = {
  params: Promise<{
    postId: string;
  }>;
};

function isUUID(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

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
