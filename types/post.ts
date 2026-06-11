import type { ApiMessageResponse, PostPaginationResponse } from "@/types/api";

export type PostAuthor = {
	id: string;
	name: string;
	email: string;
};

export type PostListItem = {
	id: string;
	title: string;
	content: string;
	createdAt: string;
	author: {
		name: string;
		email: string;
	};
	commentCount: number;
	likeCount: number;
	bookmarkCount: number;
	viewCount: number;
};

export type PopularPostItem = {
	id: string;
	title: string;
	author: string;
	createdAt: string;
	likeCount: number;
	commentCount: number;
};

export type RecentPostItem = {
	id: string;
	title: string;
	author: string;
	createdAt: string;
};

export type PostDetail = {
	id: string;
	title: string;
	content: string;
	viewCount: number;
	createdAt: string;
	updatedAt: string;
	author: PostAuthor;
	commentCount: number;
	likeCount: number;
	bookmarkCount: number;
	likedByCurrentUser: boolean;
	bookmarkedByCurrentUser: boolean;
};

export type CreatePostResponse = ApiMessageResponse & {
	post?: {
		id: string;
	};
};

export type UpdatePostResponse = ApiMessageResponse & {
	post?: {
		id: string;
	};
};

export type DeletePostResponse = ApiMessageResponse;

export type PostDetailResponse = ApiMessageResponse & {
	post?: PostDetail;
};

export type LikeButtonResponse = ApiMessageResponse & {
	liked?: boolean;
	likeCount?: number;
};

export type PostsResponse = ApiMessageResponse & {
	posts?: PostListItem[];
	pagination?: PostPaginationResponse;
};

export type BookmarkButtonResponse = ApiMessageResponse & {
	bookmarked?: boolean;
	bookmarkCount?: number;
}

export type BookmarkedPostItem = PostListItem & {
	bookmarkedAt: string;
};

export type BookmarkedPostsResponse = {
	posts?: BookmarkedPostItem[];
	message?: string;
};