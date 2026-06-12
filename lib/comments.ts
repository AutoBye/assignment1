import "server-only";

import {
  getCommentsByPostId as getCommentsByPostIdFromService,
  type CommentsPageResult,
} from "@/lib/services/comment.service";

export async function getCommentsByPostId(
  postId: string,
  page: number,
): Promise<CommentsPageResult> {
  return getCommentsByPostIdFromService(postId, page, {
    notFoundBehavior: "empty",
  });
}
