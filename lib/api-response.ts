import { NextResponse } from "next/server";

export function jsonError(
  message: string,
  status: number,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json(
    {
      message,
      ...extra,
    },
    {
      status,
    },
  );
}

export function jsonSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, {
    status,
  });
}

export function jsonMessage(message: string, status = 200) {
  return NextResponse.json(
    {
      message,
    },
    {
      status,
    },
  );
}

export function jsonUser<TUser>(message: string, user: TUser, status = 200) {
  return NextResponse.json(
    {
      message,
      user,
    },
    {
      status,
    },
  );
}
