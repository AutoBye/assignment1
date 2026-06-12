export const queryKeys = {
	auth: {
		currentUser: ["auth", "currentUser"] as const,
	},

	me: {
		bookmarks: ["me", "bookmarks"] as const,
	},

	comments: {
		all: ["comments"] as const,
		list: (postId: string, page: number) =>
			["comments", postId, page] as const,
		post: (postId: string) => ["comments", postId] as const,
	},

	posts: {
		all: ["posts"] as const,
		detail: (postId: string) => ["posts", postId] as const,
	},
};