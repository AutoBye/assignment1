import { NextRequest } from "next/server";
import { jsonSuccess } from "@/lib/api-response";
import { requireCurrentUser } from "@/lib/server/auth-guard";
import { toRouteErrorResponse } from "@/lib/server/route-error";
import { updateMyProfile } from "@/lib/services/me.service";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await requireCurrentUser();
    const body = await request.json();

    const result = await updateMyProfile(currentUser.id, body);

    return jsonSuccess(result);
  } catch (error) {
    return toRouteErrorResponse(error, "프로필 수정 중 오류가 발생했습니다.");
  }
}
