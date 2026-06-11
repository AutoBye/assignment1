import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonSuccess } from "@/lib/api-response";
import { isUUID } from "@/lib/validators";

export const runtime = "nodejs";

type BookmarkRouteContext = {
	params: Promise<{
		postId: string;
	}>;
};

export async function POST(
	_request: NextRequest,
	{ params }: BookmarkRouteContext,
) {
	try {
		const currentUser = await getCurrentUser();

		if (!currentUser) {
			return jsonError("로그인이 필요합니다.", 401);
		}

		const { postId } = await params;

		if (!isUUID(postId)) {
			return jsonError("올바르지 않은 게시글 ID입니다.", 400);
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
			return jsonError("게시글을 찾을 수 없습니다,", 404);
		}

		const existingBookmark = await prisma.bookmark.findUnique({
			where: {
				postId_userId: {
					postId,
					userId: currentUser.id,
				},
			},
			select: {
				postId: true,
				userId: true,
			},
		});

		let bookmarked: boolean;

		if (existingBookmark) {
			await prisma.bookmark.delete({
				where: {
					postId_userId: {
						postId,
						userId: currentUser.id,
					},
				},
			});

			bookmarked = false;
		} else {
			await prisma.bookmark.create({
				data: {
					postId,
					userId: currentUser.id,
				},
			});

			bookmarked = true;
		}

		const bookmarkCount = await prisma.bookmark.count({
			where: {
				postId,
			},
		});

		return jsonSuccess({
			message: bookmarked
			? "북마크에 추가했습니다."
				: "북마크를 취소했습니다.",
			bookmarked,
			bookmarkCount,
		});
	} catch (error) {
		console.log(error);

		return jsonError("북마크 처리 중 오류가 발생했습니다.", 500);
	}
}