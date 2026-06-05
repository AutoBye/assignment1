"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SubmitEventHandler } from "react";

const REMEMBER_EMAIL_KEY = "assignment1_remember_email";

// useState에 함수를 넘기면 그 함수는 컴포넌트 초기화 시 초기 state를 계산하는 initializer로 사용
// 반대로 useEffect 안에서 즉시 setState를 호출하면 불필요한 추가 렌더링이 발생할 수 있어 react-hooks/set-state-in-effect 규칙에 걸림
// useEffect 제거

function getRememberedEmail() {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem(REMEMBER_EMAIL_KEY) ?? "";
}

function getInitialRememberEmailChecked() {
  if (typeof window === "undefined") {
    return false;
  }

  return localStorage.getItem(REMEMBER_EMAIL_KEY) !== null;
}

export default function LoginPage() {
  const router = useRouter();

  // 입력값 - useEffect 제거한 대신에 초기 값에 넣었음
  const [email, setEmail] = useState(getRememberedEmail);
  const [password, setPassword] = useState("");

  // 아이디 기억하기 체크 여부
  const [rememberEmail, setRememberEmail] = useState(
      getInitialRememberEmailChecked,
  );

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /* formEvent는 왜 지원 중단인가?
  * 과거에는 submit, change, input 등 서로 다른 성격의 이벤트들도 모두 FormEvent로 처리할 수 있었습니다.
  * 하지만 타입 안정성을 높이고 이벤트별 정확한 속성을 제공하기 위해 각 이벤트에 맞는 개별 타입을 사용하도록 타입 정의가 개선되었습니다. - 수코딩
  * */
  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    setMessage("");
    setIsLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      // 로그인 요청
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
        }),
      });

      const data = (await response.json()) as {
        message?: string;
      };

      if (!response.ok) {
        setMessage(data.message ?? "로그인에 실패했습니다.");
        return;
      }

      // 로그인 성공 후 아이디 기억하기 처리
      if (rememberEmail) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, normalizedEmail);
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }

      router.replace("/");
      router.refresh();
    } catch {
      setMessage("로그인 요청 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <main className="mx-auto max-w-md p-4">
        <section className="rounded border bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">로그인</h1>

            <Link href="/" className="text-sm text-gray-500 hover:text-blue-500">
              메인으로
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                이메일
              </label>

              <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded border px-3 py-2"
                  placeholder="example@test.com"
              />
            </div>

            <div>
              <label
                  htmlFor="password"
                  className="mb-1 block text-sm font-medium"
              >
                비밀번호
              </label>

              <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded border px-3 py-2"
                  placeholder="비밀번호 입력"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                  id="rememberEmail"
                  type="checkbox"
                  checked={rememberEmail}
                  onChange={(event) => setRememberEmail(event.target.checked)}
                  className="h-4 w-4"
              />

              <label htmlFor="rememberEmail" className="text-sm text-gray-600">
                아이디 기억하기
              </label>
            </div>

            {message && <p className="text-sm text-red-500">{message}</p>}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded bg-blue-500 px-4 py-2 text-white disabled:bg-gray-400"
            >
              {isLoading ? "처리 중..." : "로그인"}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <Link href="/" className="text-gray-500 hover:text-blue-500">
              메인화면으로 돌아가기
            </Link>

            <p className="text-gray-600">
              계정이 없으신가요?{" "}
              <Link href="/register" className="text-blue-500">
                회원가입
              </Link>
            </p>
          </div>
        </section>
      </main>
  );
}