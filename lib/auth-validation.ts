type ValidationError = {
  ok: false;
  status: number;
  message: string;
};

type LoginValidationSuccess = {
  ok: true;
  data: {
    email: string;
    password: string;
  };
};

type RegisterValidationSuccess = {
  ok: true;
  data: {
    email: string;
    password: string;
    name: string;
  };
};

type LoginValidationResult = LoginValidationSuccess | ValidationError;
type RegisterValidationResult = RegisterValidationSuccess | ValidationError;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateLoginInput(body: unknown): LoginValidationResult {
  if (!body || typeof body !== "object") {
    return {
      ok: false,
      status: 400,
      message: "잘못된 요청입니다.",
    };
  }

  const values = body as {
    email?: unknown;
    password?: unknown;
  };

  const email =
    typeof values.email === "string" ? values.email.trim().toLowerCase() : "";
  const password = typeof values.password === "string" ? values.password : "";

  if (!email || !password) {
    return {
      ok: false,
      status: 400,
      message: "이메일과 비밀번호를 입력해주세요.",
    };
  }

  if (!isValidEmail(email)) {
    return {
      ok: false,
      status: 400,
      message: "올바른 이메일 형식이 아닙니다.",
    };
  }

  return {
    ok: true,
    data: {
      email,
      password,
    },
  };
}

export function validateRegisterInput(body: unknown) : RegisterValidationResult {

	if (!body || typeof body !== "object") {
		return {
			ok: false,
			status: 400,
			message: "잘못된 요청입니다.",
		};
	}

	const values = body as {
		email?: unknown;
		password?: unknown;
		name?: unknown;
	};

	const email =
		typeof values.email === "string" ? values.email.trim().toLowerCase() : "";
	const password = typeof values.password === "string" ? values.password : "";
	const name = typeof values.name === "string" ? values.name.trim() : "";

	if (!email || !password || !name) {
		return {
			ok: false,
			status: 400,
			message: "이메일, 비밀번호, 이름을 모두 입력해주세요.",
		};
	}

	if (!isValidEmail(email)) {
		return {
			ok: false,
			status: 400,
			message: "올바른 이메일 형식이 아닙니다.",
		};
	}

	if (password.length < 8) {
		return {
			ok: false,
			status: 400,
			message: "비밀번호는 8자 이상이어야합니다.",
		};
	}

	if (name.length < 2 || name.length > 20) {
		return {
			ok: false,
			status: 400,
			message: "이름은 2자 이상 20자 이하로 입력해주세요.",
		};
	}

	return {
		ok: true,
		data: {
			email,
			password,
			name,
		},
	};
}
