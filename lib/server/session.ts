// 얘도 서버 라이브러리다...
// 세션 생성, 조회, 폐기, 쿠키 처리
import "server-only";

import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CURRENT_USER_SELECT } from "@/lib/server/auth-user";
import { prisma } from "@/lib/server/prisma";

//쿠키 이름
export const SESSION_COOKIE_NAME = "assignment1_session";

// 유통기한
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/** 랜덤바이트 토큰 생성 */
function createRawSessionToken() {
  return crypto.randomBytes(32).toString("base64url");
}

/** 토큰 해쉬 */
function hashSessionToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/** 세션 만료일 */
function getSessionExpiresAt() {
  return new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
}

/** 세션 생성 */
export async function createSession(userId: string) {
  const token = createRawSessionToken();

  await prisma.session.create({
    data: {
      tokenHash: hashSessionToken(token),
      userId,
      expiresAt: getSessionExpiresAt(),
    },
  });

  return token;
}

/** 세션 쿠키 */
export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/** 세션 클리어 */
export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/** 세션 취소 */
export async function revokeCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return;
  }

  await prisma.session.updateMany({
    where: {
      tokenHash: hashSessionToken(token),
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

/** 세션 getter */
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: {
      tokenHash: hashSessionToken(token),
    },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      revokedAt: true,
      user: {
        select: CURRENT_USER_SELECT,
      },
    },
  });

  if (!session || session.revokedAt) {
    return null;
  }

  if (session.expiresAt <= new Date()) {
    await prisma.session
      .update({
        where: {
          id: session.id,
        },
        data: {
          revokedAt: new Date(),
        },
      })
      .catch(() => undefined);

    return null;
  }

  return session;
}
