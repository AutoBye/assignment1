import { redirect } from "next/navigation";
import BookmarkedPosts from "@/components/me/BookmarkedPosts";
import PasswordChangeForm from "@/components/me/PasswordChangeForm";
import ProfileForm from "@/components/me/ProfileForm";
import ProfileSummary from "@/components/me/ProfileSummary";
import { getCurrentUser } from "@/lib/auth";

export default async function MyPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  return (
    <section className="space-y-4">
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
    </section>
  );
}
