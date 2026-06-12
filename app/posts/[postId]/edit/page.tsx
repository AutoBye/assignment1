import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PostEditForm from "@/components/post/PostEditForm";
import { CurrentUserProvider } from "@/components/providers/CurrentUserProvider";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

type EditPostPageProps = {
  params: Promise<{
    postId: string;
  }>;
};

export default async function EditPostPage({ params }: EditPostPageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect(`/login`);
  }

  const { postId } = await params;

  return (
    <div className="min-h-screen bg-muted/40">
      <Header />

      <main className="mx-auto max-w-4xl p-4">
        <CurrentUserProvider currentUser={currentUser}>
          <PostEditForm postId={postId} />
        </CurrentUserProvider>
      </main>

      <Footer />
    </div>
  );
}
