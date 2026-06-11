import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";

export const runtime = "nodejs";

function validatePasswordInput(body: unknown) {
  if (!body || typeof body !== "object") {
    return {
      ok: false as const,
      message: "잘못된 요청입니다.",
    };
  }

  const value = body as {
    currentPassword?: unknown;
    newPassword?: unknown;
  };

  const currentPassword =
    typeof value.currentPassword === "string" ? value.currentPassword : "";
  const newPassword =
    typeof value.newPassword === "string" ? value.newPassword : "";

  if (!currentPassword || !newPassword) {
    return {
      ok: false as const,
      message: "현재 비밀번호와 새 비밀번호를 모두 입력해주세요.",
    };
  }

  if (newPassword.length < 8) {
    return {
      ok: false as const,
      message: "새 비밀번호는 8자 이상이어야 합니다.",
    };
  }

  if (currentPassword === newPassword) {
    return {
      ok: false as const,
      message: "새 비밀번호는 현재 비밀번호와 달라야 합니다.",
    };
  }

  return {
    ok: true as const,
    data: {
      currentPassword,
      newPassword,
    },
  };
}

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return jsonError("로그인이 필요합니다.", 401);
    }

    const body = await request.json();
    const validation = validatePasswordInput(body);

    if (!validation.ok) {
      return jsonError(validation.message, 400);
    }

    const user = await prisma.user.findUnique({
      where: {
        id: currentUser.id,
      },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return jsonError("사용자를 찾을 수 없습니다.", 404);
    }

    const isValidPassword = await verifyPassword(
      validation.data.currentPassword,
      user.passwordHash,
    );

    if (!isValidPassword) {
      return jsonError("현재 비밀번호가 올바르지 않습니다.", 400);
    }

    const newPasswordHash = await hashPassword(validation.data.newPassword);

    await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    return jsonSuccess({
      message: "비밀번호가 변경되었습니다.",
    });
  } catch (error) {
    console.log(error);

    return jsonError("비밀번호 변경 중 오류가 발생했습니다.", 500);
  }
}
