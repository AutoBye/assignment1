import { NextRequest } from "next/server";
import { jsonSuccess } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth";
import { getPostDetail } from "@/lib/posts";
import { isUUID } from "@/lib/validators";
import { requireCurrentUser } from "@/lib/server/auth-guard";
import { RouteError, toRouteErrorResponse } from "@/lib/server/route-error";
import { deletePost, updatePost } from "@/lib/services/post.service";

export const runtime = "nodejs";

type PostDetailRouteContext = {
  params: Promise<{
    postId: string;
  }>;
};

export async function GET(
  _request: NextRequest,
  { params }: PostDetailRouteContext,
) {
  try {
    const { postId } = await params;

    //아니 거 참 throw 좀 던질 수 있지 뭐
    if (!isUUID(postId)) {
      throw new RouteError("올바르지 않은 게시글 ID입니다.", 400);
    }

    const currentUser = await getCurrentUser();
    const post = await getPostDetail(postId, currentUser?.id);

    if (!post) {
      throw new RouteError("게시글을 찾을 수 없습니다.", 404);
    }

    return jsonSuccess({
      post,
    });
  } catch (error) {
    return toRouteErrorResponse(error, "게시글 조회 중 오류가 발생했습니다.");
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: PostDetailRouteContext,
) {
  try {
    const currentUser = await requireCurrentUser();
    const { postId } = await params;
    const body = await request.json();

    const result = await updatePost(postId, body, currentUser.id);

    return jsonSuccess(result);
  } catch (error) {
    return toRouteErrorResponse(error, "게시글 수정 중 오류가 발생했습니다.");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: PostDetailRouteContext,
) {
  try {
    const currentUser = await requireCurrentUser();
    const { postId } = await params;

    const result = await deletePost(postId, currentUser.id);

    return jsonSuccess(result);
  } catch (error) {
    return toRouteErrorResponse(error, "게시글 삭제 중 오류가 발생했습니다.");
  }
}
