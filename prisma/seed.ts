import "dotenv/config";
import bcrypt from "bcryptjs";
import {PrismaPg} from "@prisma/adapter-pg";
import {PrismaClient} from "@/lib/generated/prisma/client";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
	adapter,
	log: ["error", "warn"],
});

const USER_COUNT = 500;
const POST_COUNT_PER_USER = 5;
const COMMENTS_PER_POST = 10;
const REPLIES_PER_COMMENT = 10;
const LIKES_PER_POST = 9;

const SEED_PASSWORD = "Password123!";
const SEED_EMAIL_DOMAIN = "example.com";

function getSeedEmail(index: number) {
	return `seed-user-${index}@${SEED_EMAIL_DOMAIN}`;
}

function getRandomItems<T>(items: T[], count: number) {
	const copiedItems = [...items];

	for (let index = copiedItems.length - 1; index > 0; index -= 1) {
		const randomIndex = Math.floor(Math.random() * (index + 1));
		const temporaryItem = copiedItems[index];
		copiedItems[index] = copiedItems[randomIndex];
		copiedItems[randomIndex] = temporaryItem;
	}

	return copiedItems.slice(0, count);
}

function getPostTitle(postNumber: number) {
	const titles = [
		"Next.js 게시판 프로젝트 진행 기록",
		"Prisma와 PostgreSQL 연결하면서 배운 점",
		"댓글 기능을 구현하면서 생긴 고민",
		"좋아요 기능은 어디까지 검증해야 할까?",
		"로그인 세션 처리 방식 정리",
		"TypeScript 타입 오류 해결 기록",
		"게시글 수정과 삭제 권한 체크",
		"Tailwind CSS로 기본 화면 구성하기",
		"API Route Handler 구조 정리",
		"대댓글 기능 구현 테스트",
	];

	return `${titles[postNumber % titles.length]} #${postNumber + 1}`;
}

function getPostContent(postNumber: number) {
	return [
		`이 글은 더미 게시글 ${postNumber + 1}번입니다.`,
		"",
		"게시판 프로젝트의 기본 기능을 테스트하기 위해 작성된 데이터입니다.",
		"회원가입, 로그인, 글쓰기, 댓글, 대댓글, 좋아요 기능이 정상적으로 동작하는지 확인할 수 있습니다.",
		"",
		"실제 사용자가 작성한 글은 아니며 개발 환경에서 UI와 API 동작을 확인하기 위한 예시입니다.",
	].join("\n");
}

function getCommentContent(postNumber: number, commentNumber: number) {
	return `게시글 ${postNumber + 1}번에 작성된 더미 댓글 ${
		commentNumber + 1
	}번입니다. 댓글 목록 표시와 작성자 정보를 확인하기 위한 데이터입니다.`;
}

function getReplyContent(
	postNumber: number,
	commentNumber: number,
	replyNumber: number,
) {
	return `게시글 ${postNumber + 1}번의 댓글 ${
		commentNumber + 1
	}번에 작성된 대댓글 ${replyNumber + 1}번입니다.`;
}

async function deleteExistingSeedUsers() {
	const seedEmails = Array.from({ length: USER_COUNT }, (_, index) =>
		getSeedEmail(index + 1),
	);

	await prisma.user.deleteMany({
		where: {
			email: {
				in: seedEmails,
			},
		},
	});
}

async function createSeedUsers() {
	const passwordHash = await bcrypt.hash(SEED_PASSWORD, 12);

	await prisma.user.createMany({
		data: Array.from({ length: USER_COUNT }, (_, index) => {
			const userNumber = index + 1;

			return {
				email: getSeedEmail(userNumber),
				name: `더미유저${userNumber}`,
				passwordHash,
			};
		}),
		skipDuplicates: true,
	});

	return prisma.user.findMany({
		where: {
			email: {
				in: Array.from({length: USER_COUNT}, (_, index) =>
					getSeedEmail(index + 1),
				),
			},
		},
		orderBy: {
			email: "asc",
		},
		select: {
			id: true,
			email: true,
			name: true,
		},
	});
}

async function createSeedPosts(
	users: Array<{
		id: string;
		email: string;
		name: string;
	}>,
) {
	const createdPosts = [];
	let postNumber = 0;

	for (const user of users) {
		for (
			let postIndex = 0;
			postIndex < POST_COUNT_PER_USER;
			postIndex += 1
		) {
			const createdAt = new Date(
				Date.now() - (postNumber + 1) * 1000 * 60 * 60,
			);

			const post = await prisma.post.create({
				data: {
					title: getPostTitle(postNumber),
					content: getPostContent(postNumber),
					authorId: user.id,
					createdAt,
				},
				select: {
					id: true,
					title: true,
					authorId: true,
				},
			});

			createdPosts.push(post);
			postNumber += 1;
		}
	}

	return createdPosts;
}

async function createSeedComments(
	users: Array<{
		id: string;
		email: string;
		name: string;
	}>,
	posts: Array<{
		id: string;
		title: string;
		authorId: string;
	}>,
) {
	let totalCommentCount = 0;
	let totalReplyCount = 0;

	for (let postIndex = 0; postIndex < posts.length; postIndex += 1) {
		const post = posts[postIndex];

		for (
			let commentIndex = 0;
			commentIndex < COMMENTS_PER_POST;
			commentIndex += 1
		) {
			const commentAuthor =
				users[(postIndex + commentIndex + 1) % users.length];

			const comment = await prisma.comment.create({
				data: {
					content: getCommentContent(postIndex, commentIndex),
					postId: post.id,
					authorId: commentAuthor.id,
				},
				select: {
					id: true,
				},
			});

			totalCommentCount += 1;

			for (
				let replyIndex = 0;
				replyIndex < REPLIES_PER_COMMENT;
				replyIndex += 1
			) {
				const replyAuthor =
					users[
					(postIndex + commentIndex + replyIndex + 2) % users.length
						];

				await prisma.comment.create({
					data: {
						content: getReplyContent(postIndex, commentIndex, replyIndex),
						postId: post.id,
						authorId: replyAuthor.id,
						parentId: comment.id,
					},
				});

				totalReplyCount += 1;
			}
		}
	}

	return {
		totalCommentCount,
		totalReplyCount,
	};
}

async function createSeedLikes(
	users: Array<{
		id: string;
		email: string;
		name: string;
	}>,
	posts: Array<{
		id: string;
		title: string;
		authorId: string;
	}>,
) {
	let totalLikeCount = 0;

	for (const post of posts) {
		const likeUsers = getRandomItems(
			users.filter((user) => user.id !== post.authorId),
			LIKES_PER_POST,
		);

		await prisma.postLike.createMany({
			data: likeUsers.map((user) => ({
				postId: post.id,
				userId: user.id,
			})),
			skipDuplicates: true,
		});

		totalLikeCount += likeUsers.length;
	}

	return totalLikeCount;
}

async function main() {
	if (!process.env.DATABASE_URL) {
		throw new Error("DATABASE_URL 환경 변수가 없습니다.");
	}

	console.log("기존 더미 계정을 삭제합니다.");
	await deleteExistingSeedUsers();

	console.log("더미 계정을 생성합니다.");
	const users = await createSeedUsers();

	console.log("더미 게시글을 생성합니다.");
	const posts = await createSeedPosts(users);

	console.log("더미 댓글과 대댓글을 생성합니다.");
	const { totalCommentCount, totalReplyCount } = await createSeedComments(
		users,
		posts,
	);

	console.log("더미 좋아요를 생성합니다.");
	const totalLikeCount = await createSeedLikes(users, posts);

	console.log("더미 데이터 생성 완료");
	console.log(`계정: ${users.length}개`);
	console.log(`게시글: ${posts.length}개`);
	console.log(`댓글: ${totalCommentCount}개`);
	console.log(`대댓글: ${totalReplyCount}개`);
	console.log(`좋아요: ${totalLikeCount}개`);
	console.log("");
	console.log("테스트 계정");
	console.log(`이메일: ${getSeedEmail(1)}`);
	console.log(`비밀번호: ${SEED_PASSWORD}`);
}

main()
	.catch((error) => {
		console.error("더미 데이터 생성 실패");
		console.error(error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});