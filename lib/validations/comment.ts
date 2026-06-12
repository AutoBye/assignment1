import {
  COMMENT_CONTENT_MAX_LENGTH,
  COMMENT_CONTENT_MIN_LENGTH,
} from "@/lib/constants";
import {
  getOptionalStringValue,
  getStringValue,
  isUUID,
} from "@/lib/validators";
import {
  validationError,
  validationSuccess,
  type ValidationResult,
} from "@/lib/validations/result";

export type CreateCommentInput = {
  content: string;
  parentId: string | null;
};

export type UpdateCommentInput = {
  content: string;
};

function validateCommentContent(value: unknown): ValidationResult<string> {
  const content = getStringValue(value);

  if (!content) {
    return validationError("댓글 내용을 입력해주세요.");
  }

  if (
    content.length < COMMENT_CONTENT_MIN_LENGTH ||
    content.length > COMMENT_CONTENT_MAX_LENGTH
  ) {
    return validationError(
      `댓글은 ${COMMENT_CONTENT_MIN_LENGTH}자 이상 ${COMMENT_CONTENT_MAX_LENGTH}자 이하로 입력해주세요.`,
    );
  }

  return validationSuccess(content);
}

export function validateCreateCommentInput(
  body: unknown,
): ValidationResult<CreateCommentInput> {
  if (!body || typeof body !== "object") {
    return validationError("잘못된 요청입니다.");
  }

  const values = body as {
    content?: unknown;
    parentId?: unknown;
  };

  const contentValidation = validateCommentContent(values.content);

  if (!contentValidation.ok) {
    return contentValidation;
  }

  const parentId = getOptionalStringValue(values.parentId);

  if (parentId && !isUUID(parentId)) {
    return validationError("올바르지 않은 부모 댓글 ID입니다.");
  }

  return validationSuccess({
    content: contentValidation.data,
    parentId,
  });
}

export function validateUpdateCommentInput(
  body: unknown,
): ValidationResult<UpdateCommentInput> {
  if (!body || typeof body !== "object") {
    return validationError("잘못된 요청입니다.");
  }

  const values = body as {
    content?: unknown;
  };

  const contentValidation = validateCommentContent(values.content);

  if (!contentValidation.ok) {
    return contentValidation;
  }

  return validationSuccess({
    content: contentValidation.data,
  });
}
