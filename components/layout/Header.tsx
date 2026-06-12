// 상단 메뉴
"use client";

import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import { buttonVariants } from "@/components/ui/button";
import { useCurrentUserQuery } from "@/lib/hooks/use-current-user-query";

export default function Header() {
  const { data, isLoading } = useCurrentUserQuery();
  const currentUser = data?.user ?? null;

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-4xl items-center justify-between p-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          과제 페이지
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/posts"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            게시글
          </Link>

          {isLoading ? (
            <span className="px-2 text-sm text-muted-foreground">확인 중</span>
          ) : currentUser ? (
            <>
              <Link
                href="/me"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                마이페이지
              </Link>
              <span className="px-2 text-sm text-muted-foreground">
                {currentUser.name}님
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                로그인
              </Link>

              <Link
                href="/register"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
