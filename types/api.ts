export type ApiMessageResponse = {
	message?: string;
};

export type PaginationResponse = {
	currentPage: number;
	totalPages: number;
};

export type PostPaginationResponse = PaginationResponse & {
	totalPostCount: number;
	postsPerPage: number;
};

export type CommentPaginationResponse = PaginationResponse & {
	totalRootCommentCount: number;
	commentsPerPage: number;
};