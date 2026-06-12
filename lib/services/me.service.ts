import "server-only";

import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { RouteError } from "@/lib/server/route-error";
import {
  validatePasswordChangeInput,
  validateProfileInput,
} from "@/lib/validations/user";

const CURRENT_USER_SELECT = {
  id: true,
  email: true,
  name: true,
  createdAt: true,
} as const;

export async function updateMyProfile(currentUserId: string, input: unknown) {
  const validation = validateProfileInput(input);

  if (!validation.ok) {
    throw new RouteError(validation.message, validation.status);
  }

  const user = await prisma.user.update({
    where: {
      id: currentUserId,
    },
    data: {
      name: validation.data.name,
    },
    select: CURRENT_USER_SELECT,
  });

  return {
    message: "프로필이 수정되었습니다.",
    user,
  };
}

export async function changeMyPassword(currentUserId: string, input: unknown) {
  const validation = validatePasswordChangeInput(input);

  if (!validation.ok) {
    throw new RouteError(validation.message, validation.status);
  }

  const user = await prisma.user.findUnique({
    where: {
      id: currentUserId,
    },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!user) {
    throw new RouteError("사용자를 찾을 수 없습니다.", 404);
  }

  const isValidPassword = await verifyPassword(
    validation.data.currentPassword,
    user.passwordHash,
  );

  if (!isValidPassword) {
    throw new RouteError("현재 비밀번호가 올바르지 않습니다.", 400);
  }

  const newPasswordHash = await hashPassword(validation.data.newPassword);

  await prisma.user.update({
    where: {
      id: currentUserId,
    },
    data: {
      passwordHash: newPasswordHash,
    },
  });

  return {
    message: "비밀번호가 변경되었습니다.",
  };
}

export async function getMyBookmarkedPosts(currentUserId: string) {
  const bookmarks = await prisma.bookmark.findMany({
    where: {
      userId: currentUserId,
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

  return {
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
  };
}
