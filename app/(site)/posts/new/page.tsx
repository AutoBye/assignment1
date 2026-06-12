import { redirect } from "next/navigation";
import PostWriteForm from "@/components/post/PostWriteForm";
import { getCurrentUser } from "@/lib/server/auth";

export default async function NewPostPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  return <PostWriteForm />;
}
