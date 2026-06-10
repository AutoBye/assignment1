import type { CommentsResponse } from "@/types/comment";

export async function fetchComments(postId: string, page: number) {
	const response = await fetch(`/api/posts/${postId}/comments?page=${page}`, {
		method: "GET",
	});

	const data = (await response.json()) as CommentsResponse;

	if (!response.ok) {
		throw new Error(data.message ?? "댓글 조회에 실패했습니다.");
	}

	if (!data.comments || !data.pagination) {
		throw new Error("댓글 조회 응답이 올바르지 않습니다.");
	}

	return {
		comments: data.comments,
		pagination: data.pagination,
	};
}