import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PostList from "@/components/post/PostList";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


// TODO - 이걸 전역관리 해볼까?
function formatDate(date: Date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");

	return `${year}-${month}-${day} ${hours}:${minutes}`;
}

async function getPosts() {

	const posts = await prisma.post.findMany({
		orderBy: {
			createdAt: "desc",
		},
		select: {
			id: true,
			title: true,
			content: true,
			createdAt: true,
			author: {
				select: {
					name: true,
					email: true,
				},
			},
			_count: {
				select: {
					comments: true,
					likes: true,
					bookmarks: true,
				},
			},
		},
	});

	return posts.map((post) => ({
		id: post.id,
		title: post.title,
		content: post.content,
		createdAt: formatDate(post.createdAt),
		author: {
			name: post.author.name,
			email: post.author.email,
		},
		commentCount: post._count.comments,
		likeCount: post._count.likes,
		bookmarkCount: post._count.bookmarks,
	}));
}

export default async function PostsPage() {
	const currentUser = await getCurrentUser();
	const posts = await getPosts();

	return (
		<div className="min-h-screen bg-gray-100">
			<Header currentUser={currentUser} />

			<main className="mx-auto max-w-4xl p-4">
				<PostList posts={posts} />
			</main>

			<Footer />
		</div>
	);
}
