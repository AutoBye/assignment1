import { getCurrentUser } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return jsonError("로그인이 필요합니다.", 401);
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: currentUser.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            content: true,
            viewCount: true,
            createdAt: true,
            author: {
              select: {
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
        },
      },
    });

    return jsonSuccess({
      posts: bookmarks.map((bookmark) => ({
        id: bookmark.post.id,
        title: bookmark.post.title,
        content: bookmark.post.content,
        viewCount: bookmark.post.viewCount,
        createdAt: bookmark.post.createdAt.toISOString(),
        author: bookmark.post.author,
        commentCount: bookmark.post._count.comments,
        likeCount: bookmark.post._count.likes,
        bookmarkCount: bookmark.post._count.bookmarks,
        bookmarkedAt: bookmark.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.log(error);

    return jsonError("북마크 목록을 가져오는 중 오류가 발생했습니다.", 500);
  }
}
