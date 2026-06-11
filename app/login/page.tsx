"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SubmitEventHandler } from "react";
import {
  removeRememberedEmail,
  saveRememberedEmail,
  useRememberedEmail,
  useRememberEmailChecked,
} from "@/lib/remember-email";
import type { ApiMessageResponse } from "@/types/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CurrentUser } from "@/types/auth";
import { useQueryClient } from "@tanstack/react-query";
import { currentUserQueryKey } from "@/lib/use-current-user";

type LoginResponse = {
  message: string;
  user: CurrentUser;
};

async function getLoginErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as ApiMessageResponse;
    return data.message;
  } catch {
    return undefined;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 처리상태용
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 기억하는 이메일
  const rememberedEmail = useRememberedEmail();
  const rememberedEmailChecked = useRememberEmailChecked();

  //입력한거
  const [emailInput, setEmailInput] = useState("");
  const [isEmailEdited, setIsEmailEdited] = useState(false);

  //비밀번호
  const [password, setPassword] = useState("");

  // 이메일 기억하기
  const [rememberEmailInput, setRememberEmailInput] = useState<boolean | null>(
    null,
  );

  const email = isEmailEdited ? emailInput : rememberedEmail;
  const rememberEmail = rememberEmailInput ?? rememberedEmailChecked;

  /* formEvent는 왜 지원 중단인가?
   * 과거에는 submit, change, input 등 서로 다른 성격의 이벤트들도 모두 FormEvent로 처리함
   * 하지만 타입 안정성을 높이고 이벤트별 정확한 속성을 제공하기 위해 각 이벤트에 맞는 개별 타입을 사용하도록 타입 정의가 개선됨. - 수코딩
   * */
  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (isLoading) return;

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!normalizedEmail || !trimmedPassword) {
      setMessage("이메일 또는 비밀번호를 입력해주세요.");
      return;
    }

    setMessage("");
    setIsLoading(true);

    try {
      // 로그인 요청
      const response = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password: trimmedPassword,
        }),
      });

      if (!response.ok) {
        const errorMessage = await getLoginErrorMessage(response);
        setMessage(errorMessage ?? "로그인에 실패했습니다.");
        return;
      }

      const data = (await response.json()) as LoginResponse;

      if (rememberEmail) {
        saveRememberedEmail(normalizedEmail);
      } else {
        removeRememberedEmail();
      }

      queryClient.setQueryData(currentUserQueryKey, {
        user: data.user,
      });

      router.replace("/");
    } catch {
      setMessage("로그인 요청 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-md p-4">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-2xl">로그인</CardTitle>

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
                onChange={(event) => {
                  setIsEmailEdited(true);
                  setEmailInput(event.target.value);
                }}
                placeholder="example@test.com"
                autoComplete="email"
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
                placeholder="비밀번호 입력"
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="rememberEmail"
                type="checkbox"
                checked={rememberEmail}
                onChange={(event) =>
                  setRememberEmailInput(event.target.checked)
                }
                className="size-4 rounded border-input accent-primary"
              />

              <label
                htmlFor="rememberEmail"
                className="text-sm text-muted-foreground"
              >
                아이디 기억하기
              </label>
            </div>

            {message && (
              <Alert variant="destructive">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "처리 중..." : "로그인"}
            </Button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <Link
              href="/"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              메인화면으로 돌아가기
            </Link>

            <p className="text-muted-foreground">
              계정이 없으신가요?{" "}
              <Link
                href="/register"
                className="text-primary underline-offset-4 hover:underline"
              >
                회원가입
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
