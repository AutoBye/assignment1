import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PostList from "@/components/post/PostList";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const POSTS_PER_PAGE = 10;

type PostsPageProps = {
	searchParams: Promise<{
		page?: string;
	}>;
};

// TODO - 이걸 전역관리 해볼까?
function formatDate(date: Date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");

	return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function getPageNumber(page: string | undefined) {
	const pageNumber = Number(page);

	if (!Number.isInteger(pageNumber) || pageNumber < 1) {
		return 1;
	}

	return pageNumber;
}

async function getPosts(page: number) {
	const totalPostCount = await prisma.post.count();

	const totalPages = Math.max(1, Math.ceil(totalPostCount / POSTS_PER_PAGE));

	const safePage = Math.min(page, totalPages);

	const posts = await prisma.post.findMany({
		skip: (safePage - 1) * POSTS_PER_PAGE,
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
		currentPage: safePage,
		totalPages,
	};
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
	const currentUser = await getCurrentUser();
	const { page } = await searchParams;
	const currentPage = getPageNumber(page);

	const {
		posts,
		currentPage: safePage,
		totalPages,
	} = await getPosts(currentPage);

	return (
		<div className="min-h-screen bg-gray-100">
			<Header currentUser={currentUser} />

			<main className="mx-auto max-w-4xl p-4">
				<PostList
					posts={posts}
					currentPage={safePage}
					totalPages={totalPages}
				/>
			</main>

			<Footer />
		</div>
	);
}
