import { NextRequest } from "next/server";
import { jsonSuccess } from "@/lib/api-response";
import { requireCurrentUser } from "@/lib/server/auth-guard";
import { toRouteErrorResponse } from "@/lib/server/route-error";
import { togglePostBookmark } from "@/lib/services/post-write.service";

export const runtime = "nodejs";

type BookmarkRouteContext = {
  params: Promise<{
    postId: string;
  }>;
};

export async function POST(
  _request: NextRequest,
  { params }: BookmarkRouteContext,
) {
  try {
    const currentUser = await requireCurrentUser();
    const { postId } = await params;

    const result = await togglePostBookmark(postId, currentUser.id);

    return jsonSuccess(result);
  } catch (error) {
    return toRouteErrorResponse(error, "북마크 처리 중 오류가 발생했습니다.");
  }
}
