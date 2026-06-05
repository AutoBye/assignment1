"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SubmitEventHandler } from "react";

export default function LoginPage() {
  const router = useRouter();

  // 입력값
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    setMessage("");
    setIsLoading(true);

    try {
      // 로그인 요청
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
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

      router.push("/");
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
        <h1 className="mb-4 text-2xl font-bold">로그인</h1>

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

          {message && <p className="text-sm text-red-500">{message}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded bg-blue-500 px-4 py-2 text-white disabled:bg-gray-400"
          >
            {isLoading ? "처리 중..." : "로그인"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          아직 계정이 없으신가요?{" "}
          <Link href="/register" className="text-blue-500">
            회원가입
          </Link>
        </p>
      </section>
    </main>
  );
}
