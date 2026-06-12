import "server-only";

import { prisma } from "@/lib/prisma";
import { isUUID } from "@/lib/validators";
import { validatePostInput } from "@/lib/validations/post";
import { RouteError } from "@/lib/server/route-error";

const POST_AUTHOR_SELECT = {
  id: true,
  name: true,
  email: true,
} as const;

const POST_WRITE_SELECT = {
  id: true,
  title: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: POST_AUTHOR_SELECT,
  },
} as const;

function assertValidPostId(postId: string) {
  if (!isUUID(postId)) {
    throw new RouteError("올바르지 않은 게시글 ID입니다.", 400);
  }
}

async function findPostOwner(postId: string) {
  assertValidPostId(postId);

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
    throw new RouteError("게시글을 찾을 수 없습니다.", 404);
  }

  return post;
}

function assertPostAuthor(
  postAuthorId: string,
  currentUserId: string,
  action: "수정" | "삭제",
) {
  if (postAuthorId !== currentUserId) {
    throw new RouteError(`게시글을 ${action}할 권한이 없습니다.`, 403);
  }
}

export async function createPost(input: unknown, currentUserId: string) {
  const validation = validatePostInput(input);

  if (!validation.ok) {
    throw new RouteError(validation.message, validation.status);
  }

  const post = await prisma.post.create({
    data: {
      title: validation.data.title,
      content: validation.data.content,
      authorId: currentUserId,
    },
    select: POST_WRITE_SELECT,
  });

  return {
    message: "게시글이 작성되었습니다.",
    post,
  };
}

export async function updatePost(
  postId: string,
  input: unknown,
  currentUserId: string,
) {
  const validation = validatePostInput(input);

  if (!validation.ok) {
    throw new RouteError(validation.message, validation.status);
  }

  const post = await findPostOwner(postId);
  assertPostAuthor(post.authorId, currentUserId, "수정");

  const updatedPost = await prisma.post.update({
    where: {
      id: post.id,
    },
    data: {
      title: validation.data.title,
      content: validation.data.content,
    },
    select: POST_WRITE_SELECT,
  });

  return {
    message: "게시글이 수정되었습니다.",
    post: updatedPost,
  };
}

export async function deletePost(postId: string, currentUserId: string) {
  const post = await findPostOwner(postId);
  assertPostAuthor(post.authorId, currentUserId, "삭제");

  await prisma.post.delete({
    where: {
      id: post.id,
    },
  });

  return {
    message: "게시글이 삭제되었습니다.",
  };
}

export async function togglePostLike(postId: string, currentUserId: string) {
  const post = await findPostOwner(postId);

  if (post.authorId === currentUserId) {
    throw new RouteError(
      "자신이 작성한 글에는 좋아요를 누를 수 없습니다.",
      403,
    );
  }

  const existingLike = await prisma.postLike.findUnique({
    where: {
      postId_userId: {
        postId,
        userId: currentUserId,
      },
    },
    select: {
      postId: true,
    },
  });

  if (existingLike) {
    const [, likeCount] = await prisma.$transaction([
      prisma.postLike.delete({
        where: {
          postId_userId: {
            postId,
            userId: currentUserId,
          },
        },
      }),
      prisma.postLike.count({
        where: {
          postId,
        },
      }),
    ]);

    return {
      message: "좋아요를 취소했습니다.",
      liked: false,
      likeCount,
    };
  }

  const [, likeCount] = await prisma.$transaction([
    prisma.postLike.create({
      data: {
        postId,
        userId: currentUserId,
      },
    }),
    prisma.postLike.count({
      where: {
        postId,
      },
    }),
  ]);

  return {
    message: "좋아요를 눌렀습니다.",
    liked: true,
    likeCount,
  };
}

export async function togglePostBookmark(
  postId: string,
  currentUserId: string,
) {
  await findPostOwner(postId);

  const existingBookmark = await prisma.bookmark.findUnique({
    where: {
      postId_userId: {
        postId,
        userId: currentUserId,
      },
    },
    select: {
      postId: true,
    },
  });

  if (existingBookmark) {
    const [, bookmarkCount] = await prisma.$transaction([
      prisma.bookmark.delete({
        where: {
          postId_userId: {
            postId,
            userId: currentUserId,
          },
        },
      }),
      prisma.bookmark.count({
        where: {
          postId,
        },
      }),
    ]);

    return {
      message: "북마크를 취소했습니다.",
      bookmarked: false,
      bookmarkCount,
    };
  }

  const [, bookmarkCount] = await prisma.$transaction([
    prisma.bookmark.create({
      data: {
        postId,
        userId: currentUserId,
      },
    }),
    prisma.bookmark.count({
      where: {
        postId,
      },
    }),
  ]);

  return {
    message: "북마크에 추가했습니다.",
    bookmarked: true,
    bookmarkCount,
  };
}
