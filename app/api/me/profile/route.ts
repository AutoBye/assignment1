import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function validateName(value: unknown) {
  if (typeof value !== "string") {
    return {
      ok: false as const,
      message: "이름을 입력해주세요.",
    };
  }

  const name = value.trim();

  if (name.length < 2 || name.length > 20) {
    return {
      ok: false as const,
      message: "이름은 2자 이상 20자 이하로 입력해주세요.",
    };
  }

  return {
    ok: true as const,
    name,
  };
}

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return jsonError("로그인이 필요합니다.", 401);
    }

    const body = (await request.json()) as {
      name?: unknown;
    };

    const validation = validateName(body.name);

    if (!validation.ok) {
      return jsonError(validation.message, 400);
    }

    const user = await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        name: validation.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return jsonSuccess({
      message: "프로필이 수정되었습니다.",
      user,
    });
  } catch (error) {
    console.log(error);

    return jsonError("프로필 수정 중 오류가 발생했습니다.", 500);
  }
}
