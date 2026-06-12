import { NextRequest } from "next/server";
import { jsonSuccess } from "@/lib/api-response";
import { requireCurrentUser } from "@/lib/server/auth-guard";
import { toRouteErrorResponse } from "@/lib/server/route-error";
import { togglePostLike } from "@/lib/services/post.service";

export const runtime = "nodejs";

type LikeRouteContext = {
  params: Promise<{
    postId: string;
  }>;
};

export async function POST(
  _request: NextRequest,
  { params }: LikeRouteContext,
) {
  try {
    const currentUser = await requireCurrentUser();
    const { postId } = await params;

    const result = await togglePostLike(postId, currentUser.id);

    return jsonSuccess(result);
  } catch (error) {
    return toRouteErrorResponse(error, "좋아요 처리 중 오류가 발생했습니다.");
  }
}
