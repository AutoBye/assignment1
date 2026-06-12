// 댓글 트리 수정용 순수 함수 라이브러리
import type { CommentItem, UpdateCommentResponse } from "@/types/comment";

type UpdatedComment = NonNullable<UpdateCommentResponse["comment"]>;

export function appendComment(
  comments: CommentItem[],
  newComment: CommentItem,
) {
  if (newComment.parentId === null) {
    return [newComment, ...comments];
  }

  return comments.map((comment) => {
    if (comment.id === newComment.parentId) {
      return {
        ...comment,
        replies: [...comment.replies, newComment],
      };
    }

    return comment;
  });
}

export function updateCommentInTree(
  comments: CommentItem[],
  updatedComment: UpdatedComment,
) {
  return comments.map((comment) => {
    if (comment.id === updatedComment.id) {
      return {
        ...comment,
        content: updatedComment.content,
        createdAt: updatedComment.createdAt,
        updatedAt: updatedComment.updatedAt,
        author: updatedComment.author,
      };
    }

    return {
      ...comment,
      replies: comment.replies.map((reply) => {
        if (reply.id === updatedComment.id) {
          return {
            ...reply,
            content: updatedComment.content,
            createdAt: updatedComment.createdAt,
            updatedAt: updatedComment.updatedAt,
            author: updatedComment.author,
          };
        }

        return reply;
      }),
    };
  });
}

export function countCommentAndReplies(comment: CommentItem) {
  return 1 + comment.replies.length;
}

export function findDeleteCount(comments: CommentItem[], commentId: string) {
  for (const comment of comments) {
    if (comment.id === commentId) {
      return countCommentAndReplies(comment);
    }

    const reply = comment.replies.find((item) => item.id === commentId);

    if (reply) {
      return 1;
    }
  }

  return 1;
}

export function removeCommentFromTree(
  comments: CommentItem[],
  commentId: string,
) {
  return comments
    .filter((comment) => comment.id !== commentId)
    .map((comment) => ({
      ...comment,
      replies: comment.replies.filter((reply) => reply.id !== commentId),
    }));
}
