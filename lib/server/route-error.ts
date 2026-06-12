import "server-only";

import { jsonError } from "@/lib/api-response";

export class RouteError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "RouteError";
    this.status = status;
  }
}

export function toRouteErrorResponse(error: unknown, fallbackMessage: string) {
  if (error instanceof RouteError) {
    return jsonError(error.message, error.status);
  }

  console.error(error);

  return jsonError(fallbackMessage, 500);
}
