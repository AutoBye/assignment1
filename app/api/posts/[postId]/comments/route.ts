import { NextRequest } from "next/server";
import { jsonSuccess } from "@/lib/server/api-response";
import { getPositivePageNumber } from "@/lib/validations/common";
import { requireCurrentUser } from "@/lib/server/auth-guard";
import { toRouteErrorResponse } from "@/lib/server/route-error";
import {
  createComment,
  getCommentsByPostId,
} from "@/lib/services/comment.service";

export const runtime = "nodejs";

type CommentsRouteContext = {
  params: Promise<{
    postId: string;
  }>;
};

export async function GET(
  request: NextRequest,
  { params }: CommentsRouteContext,
) {
  try {
    const { postId } = await params;
    const { searchParams } = new URL(request.url);
    const requestedPage = getPositivePageNumber(searchParams.get("page"));

    const result = await getCommentsByPostId(postId, requestedPage);

    return jsonSuccess(result);
  } catch (error) {
    return toRouteErrorResponse(error, "댓글 조회 중 오류가 발생했습니다.");
  }
}

export async function POST(
  request: NextRequest,
  { params }: CommentsRouteContext,
) {
  try {
    const currentUser = await requireCurrentUser();
    const { postId } = await params;
    const body = await request.json();

    const result = await createComment(postId, body, currentUser.id);

    return jsonSuccess(result, 201);
  } catch (error) {
    return toRouteErrorResponse(error, "댓글 작성 중 오류가 발생했습니다.");
  }
}
