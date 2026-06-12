import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import ProfileSummary from "@/components/me/ProfileSummary";
import ProfileForm from "@/components/me/ProfileForm";
import PasswordChangeForm from "@/components/me/PasswordChangeForm";
import BookmarkedPosts from "@/components/me/BookmarkedPosts";

export default async function MyPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <Header />

      <main className="mx-auto max-w-4xl space-y-4 p-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">마이페이지</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            계정 정보와 저장한 게시글을 관리합니다.
          </p>
        </div>

        <ProfileSummary initialUser={currentUser} />
        <ProfileForm initialUser={currentUser} />
        <PasswordChangeForm />
        <BookmarkedPosts />
      </main>

      <Footer />
    </div>
  );
}
