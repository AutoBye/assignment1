"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SubmitEventHandler } from "react";

export default function RegisterPage() {
  const router = useRouter();

  // 입력값
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // 요청 중인지
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    setMessage("");
    setIsLoading(true);

    try {
      // 회원가입 POST 요청
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name,
          password,
        }),
      });

      const data = (await response.json()) as {
        message?: string;
      };

      if (!response.ok) {
        setMessage(data.message ?? "회원가입에 실패했습니다.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setMessage("회원가입 요청 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <main className="mx-auto max-w-md p-4">
        <section className="rounded border bg-white p-6">
          <h1 className="mb-4 text-2xl font-bold">회원가입</h1>

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
              <label htmlFor="name" className="mb-1 block text-sm font-medium">
                이름
              </label>

              <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded border px-3 py-2"
                  placeholder="홍길동"
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
                  placeholder="8자 이상 입력"
              />
            </div>

            {message && <p className="text-sm text-red-500">{message}</p>}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded bg-blue-500 px-4 py-2 text-white disabled:bg-gray-400"
            >
              {isLoading ? "처리 중..." : "회원가입"}
            </button>
          </form>

          <p className="mt-4 text-sm text-gray-600">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="text-blue-500">
              로그인
            </Link>
          </p>
        </section>
      </main>
  );
}