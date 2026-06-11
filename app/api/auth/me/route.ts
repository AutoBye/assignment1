import { getCurrentUser } from "@/lib/auth";
import {jsonUser} from "@/lib/api-response";

export const runtime = "nodejs";

//유저 정보 가져오기
export async function GET() {
  const user = await getCurrentUser();

  //로그인 상태면 200 OK / 아니면 401 Unauthorized
  if (!user) {
    return jsonUser("로그인 상태 아님!!", null, 401);
  }

  return jsonUser("유저 정보 반환", user, 200);
}
