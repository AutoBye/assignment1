import { redirect } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PostEditForm from "@/components/post/PostEditForm";
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
		<div className="min-h-screen bg-gray-100">
			<Header currentUser={currentUser} />

			<main className="mx-auto max-w-4xl p-4">
				<PostEditForm postId={postId} currentUser={currentUser} />
			</main>

			<Footer />
		</div>
	);
}