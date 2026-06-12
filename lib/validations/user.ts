import {
  validationError,
  validationSuccess,
  type ValidationResult,
} from "@/lib/validations/result";

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  email: string;
  password: string;
  name: string;
};

export type ProfileInput = {
  name: string;
};

export type PasswordChangeInput = {
  currentPassword: string;
  newPassword: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getObjectValue(body: unknown) {
  if (!body || typeof body !== "object") {
    return null;
  }

  return body as Record<string, unknown>;
}

export function validateLoginInput(
  body: unknown,
): ValidationResult<LoginInput> {
  const values = getObjectValue(body);

  if (!values) {
    return validationError("잘못된 요청입니다.");
  }

  const email =
    typeof values.email === "string" ? values.email.trim().toLowerCase() : "";
  const password = typeof values.password === "string" ? values.password : "";

  if (!email || !password) {
    return validationError("이메일과 비밀번호를 입력해주세요.");
  }

  if (!isValidEmail(email)) {
    return validationError("올바른 이메일 형식이 아닙니다.");
  }

  return validationSuccess({
    email,
    password,
  });
}

export function validateRegisterInput(
  body: unknown,
): ValidationResult<RegisterInput> {
  const values = getObjectValue(body);

  if (!values) {
    return validationError("잘못된 요청입니다.");
  }

  const email =
    typeof values.email === "string" ? values.email.trim().toLowerCase() : "";
  const password = typeof values.password === "string" ? values.password : "";
  const name = typeof values.name === "string" ? values.name.trim() : "";

  if (!email || !password || !name) {
    return validationError("이메일, 비밀번호, 이름을 모두 입력해주세요.");
  }

  if (!isValidEmail(email)) {
    return validationError("올바른 이메일 형식이 아닙니다.");
  }

  if (password.length < 8) {
    return validationError("비밀번호는 8자 이상이어야 합니다.");
  }

  if (name.length < 2 || name.length > 20) {
    return validationError("이름은 2자 이상 20자 이하로 입력해주세요.");
  }

  return validationSuccess({
    email,
    password,
    name,
  });
}

export function validateProfileInput(
  body: unknown,
): ValidationResult<ProfileInput> {
  const values = getObjectValue(body);

  if (!values) {
    return validationError("잘못된 요청입니다.");
  }

  const name = typeof values.name === "string" ? values.name.trim() : "";

  if (!name) {
    return validationError("이름을 입력해주세요.");
  }

  if (name.length < 2 || name.length > 20) {
    return validationError("이름은 2자 이상 20자 이하로 입력해주세요.");
  }

  return validationSuccess({
    name,
  });
}

export function validatePasswordChangeInput(
  body: unknown,
): ValidationResult<PasswordChangeInput> {
  const values = getObjectValue(body);

  if (!values) {
    return validationError("잘못된 요청입니다.");
  }

  const currentPassword =
    typeof values.currentPassword === "string" ? values.currentPassword : "";
  const newPassword =
    typeof values.newPassword === "string" ? values.newPassword : "";

  if (!currentPassword || !newPassword) {
    return validationError("현재 비밀번호와 새 비밀번호를 모두 입력해주세요.");
  }

  if (newPassword.length < 8) {
    return validationError("새 비밀번호는 8자 이상이어야 합니다.");
  }

  if (currentPassword === newPassword) {
    return validationError("새 비밀번호는 현재 비밀번호와 달라야 합니다.");
  }

  return validationSuccess({
    currentPassword,
    newPassword,
  });
}
