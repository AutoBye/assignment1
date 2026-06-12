import "server-only";

import { COMMENTS_PER_PAGE } from "@/lib/constants";
import { prisma } from "@/lib/server/prisma";
import { RouteError } from "@/lib/server/route-error";
import { isUUID } from "@/lib/validations/common";
import {
  validateCreateCommentInput,
  validateUpdateCommentInput,
} from "@/lib/validations/comment";
import type { CommentPaginationResponse } from "@/types/api";
import type { CommentItem } from "@/types/comment";

type CommentAuthorRecord = {
  id: string;
  name: string;
  email: string;
};

type CommentRecord = {
  id: string;
  content: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  author: CommentAuthorRecord;
};

export type CommentsPageResult = {
  comments: CommentItem[];
  pagination: CommentPaginationResponse;
};

type NotFoundBehavior = "throw" | "empty";

type GetCommentsOptions = {
  notFoundBehavior?: NotFoundBehavior;
};

const COMMENT_AUTHOR_SELECT = {
  id: true,
  name: true,
  email: true,
} as const;

const COMMENT_ITEM_SELECT = {
  id: true,
  content: true,
  parentId: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: COMMENT_AUTHOR_SELECT,
  },
} as const;

const COMMENT_WITH_REPLIES_SELECT = {
  ...COMMENT_ITEM_SELECT,
  replies: {
    orderBy: {
      createdAt: "asc",
    },
    select: COMMENT_ITEM_SELECT,
  },
} as const;

function createEmptyCommentsResult(): CommentsPageResult {
  return {
    comments: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalRootCommentCount: 0,
      commentsPerPage: COMMENTS_PER_PAGE,
    },
  };
}

function toCommentItem(comment: CommentRecord & { replies?: CommentRecord[] }) {
  return {
    id: comment.id,
    content: comment.content,
    parentId: comment.parentId,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    author: comment.author,
    replies: (comment.replies ?? []).map((reply) => ({
      id: reply.id,
      content: reply.content,
      parentId: reply.parentId,
      createdAt: reply.createdAt.toISOString(),
      updatedAt: reply.updatedAt.toISOString(),
      author: reply.author,
      replies: [],
    })),
  } satisfies CommentItem;
}

function assertValidPostId(postId: string) {
  if (!isUUID(postId)) {
    throw new RouteError("올바르지 않은 게시글 ID입니다.", 400);
  }
}

function assertValidCommentId(commentId: string) {
  if (!isUUID(commentId)) {
    throw new RouteError("올바르지 않은 댓글 ID입니다.", 400);
  }
}

async function ensurePostExists(
  postId: string,
  notFoundBehavior: NotFoundBehavior,
) {
  if (!isUUID(postId)) {
    if (notFoundBehavior === "empty") {
      return false;
    }

    throw new RouteError("올바르지 않은 게시글 ID입니다.", 400);
  }

  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    select: {
      id: true,
    },
  });

  if (!post) {
    if (notFoundBehavior === "empty") {
      return false;
    }

    throw new RouteError("게시글을 찾을 수 없습니다.", 404);
  }

  return true;
}

async function assertParentComment(parentId: string | null, postId: string) {
  if (!parentId) {
    return;
  }

  if (!isUUID(parentId)) {
    throw new RouteError("올바르지 않은 부모 댓글 ID입니다.", 400);
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
    throw new RouteError("부모 댓글을 찾을 수 없습니다.", 404);
  }

  if (parentComment.postId !== postId) {
    throw new RouteError(
      "현재 게시글의 댓글에만 답글을 작성할 수 있습니다.",
      400,
    );
  }

  if (parentComment.parentId !== null) {
    throw new RouteError("대댓글에는 다시 답글을 작성할 수 없습니다.", 400);
  }
}

async function findCommentOwner(commentId: string) {
  assertValidCommentId(commentId);

  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
    select: {
      id: true,
      authorId: true,
    },
  });

  if (!comment) {
    throw new RouteError("댓글을 찾을 수 없습니다.", 404);
  }

  return comment;
}

function assertCommentAuthor(
  commentAuthorId: string,
  currentUserId: string,
  action: "수정" | "삭제",
) {
  if (commentAuthorId !== currentUserId) {
    throw new RouteError(`댓글을 ${action}할 권한이 없습니다.`, 403);
  }
}

function getRequestedPage(page: number) {
  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }

  return page;
}

export async function getCommentsByPostId(
  postId: string,
  page: number,
  options: GetCommentsOptions = {},
): Promise<CommentsPageResult> {
  const notFoundBehavior = options.notFoundBehavior ?? "throw";
  const postExists = await ensurePostExists(postId, notFoundBehavior);

  if (!postExists) {
    return createEmptyCommentsResult();
  }

  const requestedPage = getRequestedPage(page);

  const totalRootCommentCount = await prisma.comment.count({
    where: {
      postId,
      parentId: null,
    },
  });

  const totalPages = Math.max(
    1,
    Math.ceil(totalRootCommentCount / COMMENTS_PER_PAGE),
  );

  const currentPage = Math.min(requestedPage, totalPages);

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
    select: COMMENT_WITH_REPLIES_SELECT,
  });

  return {
    comments: comments.map((comment) => toCommentItem(comment)),
    pagination: {
      currentPage,
      totalPages,
      totalRootCommentCount,
      commentsPerPage: COMMENTS_PER_PAGE,
    },
  };
}

export async function createComment(
  postId: string,
  input: unknown,
  currentUserId: string,
) {
  assertValidPostId(postId);

  const validation = validateCreateCommentInput(input);

  if (!validation.ok) {
    throw new RouteError(validation.message, validation.status);
  }

  await ensurePostExists(postId, "throw");
  await assertParentComment(validation.data.parentId, postId);

  const comment = await prisma.comment.create({
    data: {
      content: validation.data.content,
      postId,
      authorId: currentUserId,
      parentId: validation.data.parentId,
    },
    select: COMMENT_ITEM_SELECT,
  });

  return {
    message: validation.data.parentId
      ? "답글이 작성되었습니다."
      : "댓글이 작성되었습니다.",
    comment: toCommentItem(comment),
  };
}

export async function updateComment(
  commentId: string,
  input: unknown,
  currentUserId: string,
) {
  const validation = validateUpdateCommentInput(input);

  if (!validation.ok) {
    throw new RouteError(validation.message, validation.status);
  }

  const comment = await findCommentOwner(commentId);
  assertCommentAuthor(comment.authorId, currentUserId, "수정");

  const updatedComment = await prisma.comment.update({
    where: {
      id: comment.id,
    },
    data: {
      content: validation.data.content,
    },
    select: COMMENT_ITEM_SELECT,
  });

  return {
    message: "댓글이 수정되었습니다.",
    comment: toCommentItem(updatedComment),
  };
}

export async function deleteComment(commentId: string, currentUserId: string) {
  const comment = await findCommentOwner(commentId);
  assertCommentAuthor(comment.authorId, currentUserId, "삭제");

  await prisma.comment.delete({
    where: {
      id: comment.id,
    },
  });

  return {
    message: "댓글이 삭제되었습니다.",
  };
}
