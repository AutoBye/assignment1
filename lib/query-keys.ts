export const queryKeys = {
  auth: {
    currentUser: ["auth", "currentUser"] as const,
  },

  me: {
    all: ["me"] as const,
    bookmarks: ["me", "bookmarks"] as const,
  },

  posts: {
    all: ["posts"] as const,
    detail: (postId: string) => ["posts", "detail", postId] as const,
  },

  comments: {
    all: ["comments"] as const,
    post: (postId: string) => ["comments", postId] as const,
    list: (postId: string, page: number) =>
      ["comments", postId, "list", page] as const,
  },
};
