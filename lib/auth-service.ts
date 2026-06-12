import "server-only";

import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
};

const AUTH_USER_SELECT = {
  id: true,
  email: true,
  name: true,
  createdAt: true,
} as const;

const AUTH_USER_WITH_PASSWORD_SELECT = {
  ...AUTH_USER_SELECT,
  passwordHash: true,
} as const;

export async function loginWithEmailPassword(input: {
  email: string;
  password: string;
}) {
  const user = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
    select: AUTH_USER_WITH_PASSWORD_SELECT,
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
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    },
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
    select: AUTH_USER_SELECT,
  });

  return {
    ok: true as const,
    user,
  };
}
