export type ApiMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

type ApiClientOptions = Omit<RequestInit, "method" | "body"> & {
  method?: ApiMethod;
  body?: unknown;
  errorMessage?: string;
};

export class ApiClientError extends Error {
  readonly status: number;
  readonly data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.data = data;
  }
}

/** 헤더 생성
 * <br> 어차피 Content-Type : application/json
 * */
function createHeaders(headers: HeadersInit | undefined, hasBody: boolean) {
  const nextHeaders = new Headers(headers);

  if (hasBody && !nextHeaders.has("Content-Type")) {
    nextHeaders.set("Content-Type", "application/json");
  }

  return nextHeaders;
}

async function readResponseBody(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function getApiMessage(data: unknown) {
  if (!data || typeof data !== "object") {
    return null;
  }

  const message = (data as { message?: unknown }).message;

  return typeof message === "string" && message.trim() ? message : null;
}

export function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

export async function apiClient<TResponse>(
  url: string,
  options: ApiClientOptions = {},
): Promise<TResponse> {
  const {
    method = "GET",
    body,
    headers,
    errorMessage = "요청 처리 중 오류가 발생했습니다.",
    credentials,
    ...restOptions
  } = options;

  const hasBody = body !== undefined;

  const response = await fetch(url, {
    ...restOptions,
    method,
    credentials: credentials ?? "include",
    headers: createHeaders(headers, hasBody),
    body: hasBody ? JSON.stringify(body) : undefined,
  });

  const data = await readResponseBody(response);

  if (!response.ok) {
    throw new ApiClientError(
      getApiMessage(data) ?? errorMessage,
      response.status,
      data,
    );
  }

  return data as TResponse;
}
