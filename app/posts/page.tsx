import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PostList from "@/components/post/PostList";
import { getCurrentUser } from "@/lib/auth";
import { POSTS_PER_PAGE } from "@/lib/constants";
import { formatDate } from "@/lib/date";
import { getPositivePageNumber } from "@/lib/validators";
import { prisma } from "@/lib/prisma";

type PostsPageProps = {
	searchParams: Promise<{
		page?: string;
	}>;
};

async function getPosts(page: number) {
	const totalPostCount = await prisma.post.count();

	const totalPages = Math.max(1, Math.ceil(totalPostCount / POSTS_PER_PAGE));
	const currentPage = Math.min(page, totalPages);

	const posts = await prisma.post.findMany({
		skip: (currentPage - 1) * POSTS_PER_PAGE,
		take: POSTS_PER_PAGE,
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

	return {
		posts: posts.map((post) => ({
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
		})),
		currentPage,
		totalPages,
	};
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
	const currentUser = await getCurrentUser();
	const { page } = await searchParams;
	const requestedPage = getPositivePageNumber(page);

	const {
		posts,
		currentPage,
		totalPages,
	} = await getPosts(requestedPage);

	return (
		<div className="min-h-screen bg-gray-100">
			<Header currentUser={currentUser} />

			<main className="mx-auto max-w-4xl p-4">
				<PostList
					posts={posts}
					currentPage={currentPage}
					totalPages={totalPages}
				/>
			</main>

			<Footer />
		</div>
	);
}
