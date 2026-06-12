export type ValidationFailure = {
  ok: false;
  status: number;
  message: string;
};

export type ValidationSuccess<TData> = {
  ok: true;
  data: TData;
};

export type ValidationResult<TData> =
  | ValidationSuccess<TData>
  | ValidationFailure;

export function validationError(
  message: string,
  status = 400,
): ValidationFailure {
  return {
    ok: false,
    status,
    message,
  };
}

export function validationSuccess<TData>(
  data: TData,
): ValidationSuccess<TData> {
  return {
    ok: true,
    data,
  };
}
