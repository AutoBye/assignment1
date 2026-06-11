import "server-only";

import {
  POPULAR_POSTS_LIMIT,
  POSTS_PER_PAGE,
  RECENT_POSTS_LIMIT,
} from "@/lib/constants";
import { formatDate, formatDateOnly } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { isUUID } from "@/lib/validators";
import type { PostDetail } from "@/types/post";

/** DB에서 인기 게시글 가져오기
 * <br> 좋아요 수가 많은 게시글 우선
 * <br> 좋아요 수 같으면 댓글 수 많은 게시글 우선
 * <br> 그것도 같으면 최신 순
 * <br> `최대 POPULAR_POSTS_LIMIT`개까지
 * */
export async function getPopularPosts() {
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
    select: {
      id: true,
      title: true,
      createdAt: true,
      author: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  return posts.map((post) => ({
    id: post.id,
    title: post.title,
    author: post.author.name,
    createdAt: formatDateOnly(post.createdAt),
    likeCount: post._count.likes,
    commentCount: post._count.comments,
  }));
}

/** DB에서 최근 게시글 가져오기
 * <br> posts 테이블에서 게시글 가져옴
 * <br> 최신순 정렬
 * <br> 최대 `RECENT_POSTS_LIMIT`개까지
 * <br> 작성자 이름 <- 수정할까말까
 * */
export async function getRecentPosts() {
  const posts = await prisma.post.findMany({
    take: RECENT_POSTS_LIMIT,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
      author: {
        select: {
          name: true,
        },
      },
    },
  });

  return posts.map((post) => ({
    id: post.id,
    title: post.title,
    author: post.author.name,
    createdAt: formatDateOnly(post.createdAt),
  }));
}

/** DB에서 페이지만큼 게시글 가져오기
 * <br> posts 테이블에서 게시글 가져옴
 * <br> 최신순 정렬
 * <br> 최대 `POSTS_PER_PAGE`개까지
 * <br> 06 - 10 검색 추가
 * @param page number: page
 * @param query 쿼리
 * */
export async function getPosts(page: number, query = "") {
  const keyword = query.trim();

  const where = keyword
    ? {
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
      }
    : undefined;

  const totalPostCount = await prisma.post.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalPostCount / POSTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);

  const posts = await prisma.post.findMany({
    where,
    skip: (currentPage - 1) * POSTS_PER_PAGE,
    take: POSTS_PER_PAGE,
    orderBy: {
      createdAt: "desc",
    },
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
  });

  return {
    posts: posts.map((post) => ({
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
    })),
    currentPage,
    totalPages,
    query: keyword,
    totalPostCount,
  };
}

/** 게시글 정보 상세조회
 * <br>
 * <br>
 * <br>
 * */
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
    select: {
      id: true,
      title: true,
      content: true,
      viewCount: true,
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
    return null;
  }

  let likedByCurrentUser = false;

  if (currentUserId) {
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

    likedByCurrentUser = existingLike !== null;
  }

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
    likedByCurrentUser,
  };
}
