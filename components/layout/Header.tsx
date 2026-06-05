//상단 메뉴
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";

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
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between p-4">
        <Link href="/" className="text-xl font-bold">
          과제용 웹 페이지
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/posts">게시글</Link>

          {currentUser ? (
            <>
              <span className="text-sm">{currentUser.name}님</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login">로그인</Link>
              <Link href="/register">회원가입</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
