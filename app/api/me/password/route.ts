import { NextRequest } from "next/server";
import { jsonSuccess } from "@/lib/api-response";
import { requireCurrentUser } from "@/lib/server/auth-guard";
import { toRouteErrorResponse } from "@/lib/server/route-error";
import { changeMyPassword } from "@/lib/services/me.service";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await requireCurrentUser();
    const body = await request.json();

    const result = await changeMyPassword(currentUser.id, body);

    return jsonSuccess(result);
  } catch (error) {
    return toRouteErrorResponse(error, "비밀번호 변경 중 오류가 발생했습니다.");
  }
}
