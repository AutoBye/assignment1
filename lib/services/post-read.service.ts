import "server-only";

import {
  POPULAR_POSTS_LIMIT,
  POSTS_PER_PAGE,
  RECENT_POSTS_LIMIT,
} from "@/lib/constants";
import { formatDate, formatDateOnly } from "@/lib/date";
import { prisma } from "@/lib/server/prisma";
import { isUUID } from "@/lib/validations/common";
import type {
  PopularPostItem,
  PostDetail,
  PostListItem,
  RecentPostItem,
} from "@/types/post";

type GetPostsResult = {
  posts: PostListItem[];
  currentPage: number;
  totalPages: number;
  query: string;
  totalPostCount: number;
};

const POST_AUTHOR_NAME_SELECT = {
  name: true,
} as const;

const POST_AUTHOR_SUMMARY_SELECT = {
  name: true,
  email: true,
} as const;

const POST_AUTHOR_DETAIL_SELECT = {
  id: true,
  name: true,
  email: true,
} as const;

const POPULAR_POST_SELECT = {
  id: true,
  title: true,
  createdAt: true,
  author: {
    select: POST_AUTHOR_NAME_SELECT,
  },
  _count: {
    select: {
      likes: true,
      comments: true,
    },
  },
} as const;

const RECENT_POST_SELECT = {
  id: true,
  title: true,
  createdAt: true,
  author: {
    select: POST_AUTHOR_NAME_SELECT,
  },
} as const;

const POST_LIST_SELECT = {
  id: true,
  title: true,
  content: true,
  viewCount: true,
  createdAt: true,
  author: {
    select: POST_AUTHOR_SUMMARY_SELECT,
  },
  _count: {
    select: {
      comments: true,
      likes: true,
      bookmarks: true,
    },
  },
} as const;

const POST_DETAIL_SELECT = {
  id: true,
  title: true,
  content: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: POST_AUTHOR_DETAIL_SELECT,
  },
  _count: {
    select: {
      comments: true,
      likes: true,
      bookmarks: true,
    },
  },
} as const;

function getTotalPages(totalCount: number, pageSize: number) {
  return Math.max(1, Math.ceil(totalCount / pageSize));
}

function getCurrentPage(requestedPage: number, totalPages: number) {
  if (!Number.isInteger(requestedPage) || requestedPage < 1) {
    return 1;
  }

  return Math.min(requestedPage, totalPages);
}

function getPostSearchWhere(keyword: string) {
  if (!keyword) {
    return undefined;
  }

  return {
    OR: [
      {
        title: {
          contains: keyword,
          mode: "insensitive" as const,
        },
      },
      {
        content: {
          contains: keyword,
          mode: "insensitive" as const,
        },
      },
      {
        author: {
          name: {
            contains: keyword,
            mode: "insensitive" as const,
          },
        },
      },
    ],
  };
}

function toPopularPostItem(post: {
  id: string;
  title: string;
  createdAt: Date;
  author: {
    name: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
}): PopularPostItem {
  return {
    id: post.id,
    title: post.title,
    author: post.author.name,
    createdAt: formatDateOnly(post.createdAt),
    likeCount: post._count.likes,
    commentCount: post._count.comments,
  };
}

function toRecentPostItem(post: {
  id: string;
  title: string;
  createdAt: Date;
  author: {
    name: string;
  };
}): RecentPostItem {
  return {
    id: post.id,
    title: post.title,
    author: post.author.name,
    createdAt: formatDateOnly(post.createdAt),
  };
}

function toPostListItem(post: {
  id: string;
  title: string;
  content: string;
  viewCount: number;
  createdAt: Date;
  author: {
    name: string;
    email: string;
  };
  _count: {
    comments: number;
    likes: number;
    bookmarks: number;
  };
}): PostListItem {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    viewCount: post.viewCount,
    createdAt: formatDate(post.createdAt),
    author: {
      name: post.author.name,
      email: post.author.email,
    },
    commentCount: post._count.comments,
    likeCount: post._count.likes,
    bookmarkCount: post._count.bookmarks,
  };
}

function toPostDetail(
  post: {
    id: string;
    title: string;
    content: string;
    viewCount: number;
    createdAt: Date;
    updatedAt: Date;
    author: {
      id: string;
      name: string;
      email: string;
    };
    _count: {
      comments: number;
      likes: number;
      bookmarks: number;
    };
  },
  currentUserStatus: {
    likedByCurrentUser: boolean;
    bookmarkedByCurrentUser: boolean;
  },
): PostDetail {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    viewCount: post.viewCount,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    author: post.author,
    commentCount: post._count.comments,
    likeCount: post._count.likes,
    bookmarkCount: post._count.bookmarks,
    likedByCurrentUser: currentUserStatus.likedByCurrentUser,
    bookmarkedByCurrentUser: currentUserStatus.bookmarkedByCurrentUser,
  };
}

async function getCurrentUserPostStatus(
  postId: string,
  currentUserId?: string,
) {
  if (!currentUserId) {
    return {
      likedByCurrentUser: false,
      bookmarkedByCurrentUser: false,
    };
  }

  const [existingLike, existingBookmark] = await Promise.all([
    prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: currentUserId,
        },
      },
      select: {
        postId: true,
      },
    }),
    prisma.bookmark.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: currentUserId,
        },
      },
      select: {
        postId: true,
      },
    }),
  ]);

  return {
    likedByCurrentUser: existingLike !== null,
    bookmarkedByCurrentUser: existingBookmark !== null,
  };
}

export async function getPopularPosts(): Promise<PopularPostItem[]> {
  const posts = await prisma.post.findMany({
    take: POPULAR_POSTS_LIMIT,
    orderBy: [
      {
        likes: {
          _count: "desc",
        },
      },
      {
        comments: {
          _count: "desc",
        },
      },
      {
        createdAt: "desc",
      },
    ],
    select: POPULAR_POST_SELECT,
  });

  return posts.map(toPopularPostItem);
}

export async function getRecentPosts(): Promise<RecentPostItem[]> {
  const posts = await prisma.post.findMany({
    take: RECENT_POSTS_LIMIT,
    orderBy: {
      createdAt: "desc",
    },
    select: RECENT_POST_SELECT,
  });

  return posts.map(toRecentPostItem);
}

export async function getPosts(
  page: number,
  query = "",
): Promise<GetPostsResult> {
  const keyword = query.trim();
  const where = getPostSearchWhere(keyword);

  const totalPostCount = await prisma.post.count({
    where,
  });

  const totalPages = getTotalPages(totalPostCount, POSTS_PER_PAGE);
  const currentPage = getCurrentPage(page, totalPages);

  const posts = await prisma.post.findMany({
    where,
    skip: (currentPage - 1) * POSTS_PER_PAGE,
    take: POSTS_PER_PAGE,
    orderBy: {
      createdAt: "desc",
    },
    select: POST_LIST_SELECT,
  });

  return {
    posts: posts.map(toPostListItem),
    currentPage,
    totalPages,
    query: keyword,
    totalPostCount,
  };
}

export async function getPostDetail(
  postId: string,
  currentUserId?: string,
): Promise<PostDetail | null> {
  if (!isUUID(postId)) {
    return null;
  }

  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    select: POST_DETAIL_SELECT,
  });

  if (!post) {
    return null;
  }

  const currentUserStatus = await getCurrentUserPostStatus(
    postId,
    currentUserId,
  );

  return toPostDetail(post, currentUserStatus);
}
