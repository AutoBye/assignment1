import { NextRequest } from "next/server";
import { jsonSuccess } from "@/lib/server/api-response";
import { requireCurrentUser } from "@/lib/server/auth-guard";
import { toRouteErrorResponse } from "@/lib/server/route-error";
import { deleteComment, updateComment } from "@/lib/services/comment.service";

export const runtime = "nodejs";

type CommentRouteContext = {
  params: Promise<{
    commentId: string;
  }>;
};

export async function DELETE(
  _request: NextRequest,
  { params }: CommentRouteContext,
) {
  try {
    const currentUser = await requireCurrentUser();
    const { commentId } = await params;

    const result = await deleteComment(commentId, currentUser.id);

    return jsonSuccess(result);
  } catch (error) {
    return toRouteErrorResponse(error, "댓글 삭제 중 오류가 발생했습니다.");
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: CommentRouteContext,
) {
  try {
    const currentUser = await requireCurrentUser();
    const { commentId } = await params;
    const body = await request.json();

    const result = await updateComment(commentId, body, currentUser.id);

    return jsonSuccess(result);
  } catch (error) {
    return toRouteErrorResponse(error, "댓글 수정 중 오류가 발생했습니다.");
  }
}
