"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SubmitEventHandler } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  removeRememberedEmail,
  saveRememberedEmail,
  useRememberedEmail,
  useRememberEmailChecked,
} from "@/lib/client/remember-email";
import { getErrorMessage } from "@/lib/api/client";
import { loginRequest } from "@/lib/queries/auth-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { currentUserQueryKey } from "@/lib/hooks/use-current-user-query";

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const rememberedEmail = useRememberedEmail();
  const rememberedEmailChecked = useRememberEmailChecked();

  const [emailInput, setEmailInput] = useState("");
  const [isEmailEdited, setIsEmailEdited] = useState(false);
  const [password, setPassword] = useState("");

  const [rememberEmailInput, setRememberEmailInput] = useState<boolean | null>(
    null,
  );

  const email = isEmailEdited ? emailInput : rememberedEmail;
  const rememberEmail = rememberEmailInput ?? rememberedEmailChecked;

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!normalizedEmail || !trimmedPassword) {
      setMessage("이메일 또는 비밀번호를 입력해주세요.");
      return;
    }

    setMessage("");
    setIsLoading(true);

    try {
      const data = await loginRequest({
        email: normalizedEmail,
        password: trimmedPassword,
      });

      if (rememberEmail) {
        saveRememberedEmail(normalizedEmail);
      } else {
        removeRememberedEmail();
      }

      queryClient.setQueryData(currentUserQueryKey, {
        user: data.user,
      });

      router.replace("/");
      router.refresh();
    } catch (error) {
      setMessage(getErrorMessage(error, "로그인 요청 중 오류가 발생했습니다."));
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
