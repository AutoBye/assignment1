import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

//쿠키 이름
export const SESSION_COOKIE_NAME = "assignment1_sesssion";
// 7일
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/** 쿠키안에 들어갈 사용자 정보 구조<p>
 * userId : 로그인한 사용자의 ID<p>
 * email : 사용자 이메일 <p>
 * name : 사용자 이름 <p>
 * exp : 만료 시간
 * */
export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  exp: number;
};



/** .env 에 있는 SESSION_SECRET값 읽어옴<p>
 *  .env에 SESSION_SECRET 값 없으면 에러남
 * */
function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET 환경 변수가 없습니다.");
  }

  return secret;
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

/** 서명
 * @param value string
 * */
function sign(value: string) {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(value)
    .digest("base64url");
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}


/** 로그인 성공 또는 회원가입 성공 시 호출
 *  @param payload 0min<세션 페이로드, 만료기간>
 *  @return 토큰 인코딩된사용자정보.서명값 토큰
 * */
export function createSessionToken(payload: Omit<SessionPayload, "exp">) {
  const sessionPayload: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };

  const encodedPayload = encodeBase64Url(JSON.stringify(sessionPayload));
  const signature = sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}


/** 쿠키에 들어있는 토큰 검증
 * @param token 토큰
 * @return null | payload
 * 1. 토큰이 있는지
 * 2. paylaod와 signature가 있는지
 * 3. SESSION_SECRET으로 다시 서명해봄
 * 4. 쿠키의 서명값과 비교
 * 5. 만료 시간이 지났는지
 * 6. 정상이면 사용자 정보 반환
 * */
export function verifySessionToken(token: string | undefined) {

  // 1
  if (!token) {
    return null;
  }


  //2
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  //3
  const expectedSignature = sign(encodedPayload);

  //4
  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      decodeBase64Url(encodedPayload),
    ) as SessionPayload;

    //5
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    //6
    return payload;
  } catch {
    return null;
  }
}

/** 로그인 성공 시 브라우저에 쿠키 저장
 * httpOnly : true
 * - JavaScript에서 쿠키 접근 불가
 * - XSS 공격 위험 완화
 *
 * secure
 * - production 에서는 HTTPS 에서만 쿠키 전송
 *
 * path: "/"
 * - 전체 사이트에서 쿠키 사용
 *
 * maxAge
 * - 쿠키 유효기간
 *
 * */
export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}


/** 로그아웃할 때 쿠키 삭제
 * maxAge: 0 으로 설정<p>브라우저에서 쿠키가 즉시 만료되게
 * */
export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/** 현재 요청의 쿠키를 읽어서 로그인 정보를 반환
 * @return verifySessionToken(token) 토큰 검증으로
 * */
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  return verifySessionToken(token);
}
