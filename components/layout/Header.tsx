// 상단 메뉴
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import { buttonVariants } from "@/components/ui/button";

type HeaderUser = {
  id: string;
  email: string;
  name: string;
};

type HeaderProps = {
  currentUser: HeaderUser | null;
};

export default function Header({ currentUser }: HeaderProps) {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-4xl items-center justify-between p-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          과제용 웹 페이지
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/posts"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            게시글
          </Link>

          {currentUser ? (
            <>
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
