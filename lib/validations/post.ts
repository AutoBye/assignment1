import {
  POST_CONTENT_MIN_LENGTH,
  POST_TITLE_MAX_LENGTH,
  POST_TITLE_MIN_LENGTH,
} from "@/lib/constants";
import { getStringValue } from "@/lib/validations/common";
import {
  validationError,
  validationSuccess,
  type ValidationResult,
} from "@/lib/validations/result";

export type PostInput = {
  title: string;
  content: string;
};

export function validatePostInput(body: unknown): ValidationResult<PostInput> {
  if (!body || typeof body !== "object") {
    return validationError("잘못된 요청입니다.");
  }

  const values = body as {
    title?: unknown;
    content?: unknown;
  };

  const title = getStringValue(values.title);
  const content = getStringValue(values.content);

  if (!title || !content) {
    return validationError("제목과 내용을 모두 입력해주세요.");
  }

  if (
    title.length < POST_TITLE_MIN_LENGTH ||
    title.length > POST_TITLE_MAX_LENGTH
  ) {
    return validationError(
      `제목은 ${POST_TITLE_MIN_LENGTH}자 이상 ${POST_TITLE_MAX_LENGTH}자 이하로 입력해주세요.`,
    );
  }

  if (content.length < POST_CONTENT_MIN_LENGTH) {
    return validationError(
      `내용은 ${POST_CONTENT_MIN_LENGTH}자 이상 입력해주세요.`,
    );
  }

  return validationSuccess({
    title,
    content,
  });
}
