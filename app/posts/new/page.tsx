import { redirect } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PostWriteForm from "@/components/post/PostWriteForm";
import { getCurrentUser } from "@/lib/auth";

export default async function NewPostPage() {
  const currentUser = await getCurrentUser();

  // 로그인 아니면 로그인으로
  if (!currentUser) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <Header currentUser={currentUser} />

      <main className="mx-auto max-w-4xl p-4">
        <PostWriteForm />
      </main>

      <Footer />
    </div>
  );
}
