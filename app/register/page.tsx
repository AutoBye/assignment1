"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SubmitEventHandler } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ApiMessageResponse } from "@/types/api";

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
      const response = await fetch(`/api/auth/register`, {
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

      const data = (await response.json()) as ApiMessageResponse;

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
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-2xl">회원가입</CardTitle>

            <Link
                href="/"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              메인으로
            </Link>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium">
                  이메일
                </label>

                <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="example@test.com"
                    autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium">
                  이름
                </label>

                <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="홍길동"
                    autoComplete="name"
                />
              </div>

              <div>
                <label
                    htmlFor="password"
                    className="mb-1 block text-sm font-medium"
                >
                  비밀번호
                </label>

                <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="8자 이상 입력"
                    autoComplete="new-password"
                />
              </div>

              {message && (
                  <Alert variant="destructive">
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
              )}

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "처리 중..." : "회원가입"}
              </Button>
            </form>

            <p className="mt-4 text-sm text-muted-foreground">
              이미 계정이 있으신가요?{" "}
              <Link
                  href="/login"
                  className="text-primary underline-offset-4 hover:underline"
              >
                로그인
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
  );
}