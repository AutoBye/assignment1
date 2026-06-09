// 서버에서 댓글 최초 조회
import "server-only";

import { COMMENTS_PER_PAGE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { isUUID } from "@/lib/validators";
import type { CommentPaginationResponse } from "@/types/api";
import type { CommentItem } from "@/types/comment";

type CommentsPageResult = {
	comments: CommentItem[];
	pagination: CommentPaginationResponse;
};

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

export async function getCommentsByPostId(
	postId: string,
	page: number,
): Promise<CommentsPageResult> {
	if (!isUUID(postId)) {
		return createEmptyCommentsResult();
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
		return createEmptyCommentsResult();
	}

	const requestedPage = Math.max(1, Math.floor(page));

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
		select: {
			id: true,
			content: true,
			parentId: true,
			createdAt: true,
			updatedAt: true,
			author: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
			replies: {
				orderBy: {
					createdAt: "asc",
				},
				select: {
					id: true,
					content: true,
					parentId: true,
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
			},
		},
	});

	return {
		comments: comments.map((comment) => ({
			id: comment.id,
			content: comment.content,
			parentId: comment.parentId,
			createdAt: comment.createdAt.toISOString(),
			updatedAt: comment.updatedAt.toISOString(),
			author: comment.author,
			replies: comment.replies.map((reply) => ({
				id: reply.id,
				content: reply.content,
				parentId: reply.parentId,
				createdAt: reply.createdAt.toISOString(),
				updatedAt: reply.updatedAt.toISOString(),
				author: reply.author,
				replies: [],
			})),
		})),
		pagination: {
			currentPage,
			totalPages,
			totalRootCommentCount,
			commentsPerPage: COMMENTS_PER_PAGE,
		},
	};
}