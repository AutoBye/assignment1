import "server-only";

import {
  CURRENT_USER_SELECT,
  CURRENT_USER_WITH_PASSWORD_SELECT,
  toCurrentUser,
} from "@/lib/server/auth-user";
import { hashPassword, verifyPassword } from "@/lib/server/password";
import { prisma } from "@/lib/server/prisma";
import type { CurrentUser } from "@/types/auth";

export type AuthUser = CurrentUser;

export async function loginWithEmailPassword(input: {
  email: string;
  password: string;
}) {
  const user = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
    select: CURRENT_USER_WITH_PASSWORD_SELECT,
  });

  if (!user) {
    return {
      ok: false as const,
      status: 401,
      message: "이메일 또는 비밀번호가 올바르지 않습니다.",
    };
  }

  const isValidPassword = await verifyPassword(
    input.password,
    user.passwordHash,
  );

  if (!isValidPassword) {
    return {
      ok: false as const,
      status: 401,
      message: "이메일 또는 비밀번호가 올바르지 않습니다.",
    };
  }

  return {
    ok: true as const,
    user: toCurrentUser(user),
  };
}

export async function registerWithEmailPassword(input: {
  email: string;
  password: string;
  name: string;
}) {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    return {
      ok: false as const,
      status: 409,
      message: "이미 가입된 이메일입니다.",
    };
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      name: input.name,
    },
    select: CURRENT_USER_SELECT,
  });

  return {
    ok: true as const,
    user: toCurrentUser(user),
  };
}
