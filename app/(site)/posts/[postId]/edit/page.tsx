import { redirect } from "next/navigation";
import PostEditForm from "@/components/post/PostEditForm";
import { CurrentUserProvider } from "@/components/providers/CurrentUserProvider";
import { getCurrentUser } from "@/lib/auth";

type EditPostPageProps = {
  params: Promise<{
    postId: string;
  }>;
};

export default async function EditPostPage({ params }: EditPostPageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const { postId } = await params;

  return (
    <CurrentUserProvider currentUser={currentUser}>
      <PostEditForm postId={postId} />
    </CurrentUserProvider>
  );
}
