import { jsonSuccess } from "@/lib/server/api-response";
import { requireCurrentUser } from "@/lib/server/auth-guard";
import { toRouteErrorResponse } from "@/lib/server/route-error";
import { getMyBookmarkedPosts } from "@/lib/services/me.service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const currentUser = await requireCurrentUser();
    const result = await getMyBookmarkedPosts(currentUser.id);

    return jsonSuccess(result);
  } catch (error) {
    return toRouteErrorResponse(
      error,
      "북마크 목록을 가져오는 중 오류가 발생했습니다.",
    );
  }
}
