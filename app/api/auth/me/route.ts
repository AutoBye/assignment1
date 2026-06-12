import { getCurrentUser } from "@/lib/auth";
import { jsonUser } from "@/lib/api-response";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return jsonUser("로그인이 필요합니다.", null, 401);
  }

  return jsonUser("현재 사용자 정보입니다.", user);
}
