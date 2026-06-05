import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

//유저 정보 가져오기
export async function GET() {
  const user = await getCurrentUser();

  //로그인 상태면 401, 아니면 null
  if (!user) {
    return NextResponse.json(
      {
        user: null,
      },
      {
        status: 401,
      },
    );
  }

  return NextResponse.json({
    user,
  });
}
