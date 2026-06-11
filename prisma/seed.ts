// DB 더미 유저용 스크립트
import "dotenv/config";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
	adapter,
	log: ["error", "warn"],
});

const USER_COUNT = 300;
const POST_COUNT_PER_USER = 8;

const MIN_COMMENTS_PER_POST = 0;
const MAX_COMMENTS_PER_POST = 18;

const MIN_REPLIES_PER_COMMENT = 0;
const MAX_REPLIES_PER_COMMENT = 6;

const MIN_VIEWS_PER_POST = 0;
const MAX_VIEWS_PER_POST = 250;

const CREATE_POST_VIEW_ROWS = true;
const CHUNK_SIZE = 1000;

const SEED_PASSWORD = "Password123!";
const SEED_EMAIL_DOMAIN = "example.com";

type SeedUser = {
	id: string;
	email: string;
	name: string;
};

type SeedPost = {
	id: string;
	title: string;
	authorId: string;
};

function getSeedEmail(index: number) {
	return `seed-user-${index}@${SEED_EMAIL_DOMAIN}`;
}

function randomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItems<T>(items: T[], count: number) {
	const copiedItems = [...items];

	for (let index = copiedItems.length - 1; index > 0; index -= 1) {
		const randomIndex = Math.floor(Math.random() * (index + 1));
		const temporaryItem = copiedItems[index];
		copiedItems[index] = copiedItems[randomIndex];
		copiedItems[randomIndex] = temporaryItem;
	}

	return copiedItems.slice(0, Math.min(count, copiedItems.length));
}

function hashValue(value: string) {
	return crypto.createHash("sha256").update(value).digest("hex");
}

async function createManyInChunks<T>(
	items: T[],
	createMany: (chunk: T[]) => Promise<unknown>,
) {
	for (let index = 0; index < items.length; index += CHUNK_SIZE) {
		const chunk = items.slice(index, index + CHUNK_SIZE);
		await createMany(chunk);
	}
}

function getPostTitle() {
	const subjects = [
		"Next.js App Router",
		"React Query",
		"Zustand",
		"Context API",
		"Prisma",
		"PostgreSQL",
		"Server Session",
		"댓글 기능",
		"좋아요 기능",
		"북마크 기능",
		"조회수 기능",
		"마이페이지",
		"권한 처리",
		"폼 상태 관리",
		"성능 최적화",
		"컴포넌트 분리",
		"타입 안정성",
		"API Route",
		"Server Component",
		"Client Component",
	];

	const actions = [
		"구현하면서 배운 점",
		"리팩토링 기록",
		"에러 해결 과정",
		"구조 개선 메모",
		"실무 방식으로 바꿔보기",
		"성능 문제 점검",
		"상태 관리 적용기",
		"테스트 데이터 검증",
		"권한 체크 정리",
		"UI 반영 문제 해결",
	];

	const contexts = [
		"게시판 프로젝트",
		"학습용 과제",
		"인증 흐름",
		"댓글 화면",
		"게시글 상세",
		"목록 페이지",
		"데이터 패칭",
		"서버 로직",
		"클라이언트 상태",
		"DB 모델링",
	];

	const templates = [
		"{subject} {action} - {context}",
		"[{context}] {subject} 적용 후기",
		"{subject} 도입 후 달라진 점",
		"{subject} 사용 중 만난 문제 해결",
		"{context}에서 {subject} 선택한 이유",
		"{subject} 리팩토링 전후 비교",
		"{subject} + {context} 구현 메모",
		"{subject} 실전 적용 사례",
		"{subject} 성능 개선 기록",
		"{context} 개발 일지 - {subject}",
		"{subject} 삽질기",
		"{subject} 적용하면서 주의한 점",
		"{subject} 구조 설계 정리",
		"{subject} 도입 검토 결과",
		"{subject} 운영 관점에서 살펴보기",
	];

	const subject = subjects[randomInt(0, subjects.length - 1)];
	const action = actions[randomInt(0, actions.length - 1)];
	const context = contexts[randomInt(0, contexts.length - 1)];
	const template = templates[randomInt(0, templates.length - 1)];

	return template
		.replace("{subject}", subject)
		.replace("{action}", action)
		.replace("{context}", context);
}

function getPostContent(postNumber: number) {
	return [
		`이 글은 더미 게시글 ${postNumber + 1}번입니다.`,
		"",
		"게시판 프로젝트의 기본 기능을 테스트하기 위해 작성된 데이터입니다.",
		"회원가입, 로그인, 글쓰기, 댓글, 답글, 좋아요, 북마크, 조회수 기능이 정상적으로 동작하는지 확인할 수 있습니다.",
		"",
		"실제 사용자가 작성한 글은 아니지만 UI와 API 흐름을 점검하기 위한 충분한 길이의 본문입니다.",
	].join("\n");
}

function getCommentContent(postNumber: number, commentNumber: number) {
	const variants = [
		"좋은 정리입니다.",
		"이 부분은 다시 확인해보면 좋을 것 같습니다.",
		"저도 비슷한 문제를 겪었습니다.",
		"구현 방식이 꽤 실무적이네요.",
		"상태 관리 흐름이 이해됩니다.",
		"서버와 클라이언트 책임 분리가 중요해 보입니다.",
		"이 예시는 테스트하기 좋습니다.",
		"댓글 UI 확인용 데이터입니다.",
	];

	return `게시글 ${postNumber + 1}번 댓글 ${commentNumber + 1}번입니다. ${
		variants[(postNumber + commentNumber) % variants.length]
	}`;
}

function getReplyContent(
	postNumber: number,
	commentNumber: number,
	replyNumber: number,
) {
	const variants = [
		"답글로 의견을 남깁니다.",
		"이 댓글에 동의합니다.",
		"추가 설명이 필요해 보입니다.",
		"좋은 피드백입니다.",
		"답글 UI 테스트용 데이터입니다.",
	];

	return `게시글 ${postNumber + 1}번 댓글 ${commentNumber + 1}번의 답글 ${
		replyNumber + 1
	}번입니다. ${variants[(postNumber + commentNumber + replyNumber) % variants.length]}`;
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
				in: Array.from({ length: USER_COUNT }, (_, index) =>
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

async function createSeedPosts(users: SeedUser[]) {
	const postData = [];
	let postNumber = 0;

	for (const user of users) {
		for (let postIndex = 0; postIndex < POST_COUNT_PER_USER; postIndex += 1) {
			const createdAt = new Date(
				Date.now() - (postNumber + 1) * 1000 * 60 * randomInt(10, 180),
			);

			postData.push({
				title: getPostTitle(),
				content: getPostContent(postNumber),
				authorId: user.id,
				viewCount: randomInt(MIN_VIEWS_PER_POST, MAX_VIEWS_PER_POST),
				createdAt,
			});

			postNumber += 1;
		}
	}

	await createManyInChunks(postData, (chunk) =>
		prisma.post.createMany({
			data: chunk,
		}),
	);

	return prisma.post.findMany({
		where: {
			authorId: {
				in: users.map((user) => user.id),
			},
		},
		orderBy: {
			createdAt: "desc",
		},
		select: {
			id: true,
			title: true,
			authorId: true,
			viewCount: true,
		},
	});
}

async function createSeedComments(users: SeedUser[], posts: SeedPost[]) {
	let totalCommentCount = 0;
	let totalReplyCount = 0;

	for (let postIndex = 0; postIndex < posts.length; postIndex += 1) {
		const post = posts[postIndex];
		const commentCount = randomInt(MIN_COMMENTS_PER_POST, MAX_COMMENTS_PER_POST);

		if (commentCount === 0) {
			continue;
		}

		const rootComments = await prisma.comment.createManyAndReturn({
			data: Array.from({ length: commentCount }, (_, commentIndex) => {
				const commentAuthor =
					users[(postIndex + commentIndex + 1) % users.length];

				return {
					content: getCommentContent(postIndex, commentIndex),
					postId: post.id,
					authorId: commentAuthor.id,
					createdAt: new Date(
						Date.now() - randomInt(1, 60 * 24 * 10) * 1000 * 60,
					),
				};
			}),
			select: {
				id: true,
			},
		});

		totalCommentCount += rootComments.length;

		const replyData = [];

		for (
			let commentIndex = 0;
			commentIndex < rootComments.length;
			commentIndex += 1
		) {
			const replyCount = randomInt(
				MIN_REPLIES_PER_COMMENT,
				MAX_REPLIES_PER_COMMENT,
			);

			for (let replyIndex = 0; replyIndex < replyCount; replyIndex += 1) {
				const replyAuthor =
					users[(postIndex + commentIndex + replyIndex + 2) % users.length];

				replyData.push({
					content: getReplyContent(postIndex, commentIndex, replyIndex),
					postId: post.id,
					authorId: replyAuthor.id,
					parentId: rootComments[commentIndex].id,
					createdAt: new Date(
						Date.now() - randomInt(1, 60 * 24 * 5) * 1000 * 60,
					),
				});
			}
		}

		if (replyData.length > 0) {
			await prisma.comment.createMany({
				data: replyData,
			});

			totalReplyCount += replyData.length;
		}
	}

	return {
		totalCommentCount,
		totalReplyCount,
	};
}

function getRandomLikeCount() {
	const chance = Math.random();

	if (chance < 0.7) {
		return randomInt(0, 20);
	}

	if (chance < 0.95) {
		return randomInt(21, 60);
	}

	return randomInt(61, 200);
}

async function createSeedLikes(users: SeedUser[], posts: SeedPost[]) {
	let totalLikeCount = 0;

	for (const post of posts) {
		const likeCount = getRandomLikeCount();

		const likeUsers = getRandomItems(
			users.filter((user) => user.id !== post.authorId),
			likeCount,
		);

		if (likeUsers.length === 0) {
			continue;
		}

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

async function createSeedPostViews(
	users: SeedUser[],
	posts: Array<SeedPost & { viewCount: number }>,
) {
	if (!CREATE_POST_VIEW_ROWS) {
		return 0;
	}

	let totalViewRowCount = 0;

	for (const post of posts) {
		const viewerUsers = getRandomItems(
			users.filter((user) => user.id !== post.authorId),
			post.viewCount,
		);

		const postViewData = viewerUsers.map((user, index) => {
			const viewerHash = hashValue(`user:${user.id}`);
			const dateBucket = new Date(
				Date.now() - index * 1000 * 60 * 60,
			)
				.toISOString()
				.slice(0, 10);

			return {
				postId: post.id,
				userId: user.id,
				viewerHash,
				dedupeKey: hashValue(`${post.id}:${viewerHash}:${dateBucket}`),
				viewerType: "user",
				ipHash: null,
				userAgent: "seed-user-agent",
				createdAt: new Date(Date.now() - index * 1000 * 60 * 60),
			};
		});

		if (postViewData.length > 0) {
			await createManyInChunks(postViewData, (chunk) =>
				prisma.postView.createMany({
					data: chunk,
					skipDuplicates: true,
				}),
			);

			totalViewRowCount += postViewData.length;
		}
	}

	return totalViewRowCount;
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

	console.log("더미 댓글과 답글을 생성합니다.");
	const { totalCommentCount, totalReplyCount } = await createSeedComments(
		users,
		posts,
	);

	console.log("더미 좋아요를 생성합니다.");
	const totalLikeCount = await createSeedLikes(users, posts);

	console.log("더미 조회 기록을 생성합니다.");
	const totalViewRowCount = await createSeedPostViews(users, posts);

	console.log("더미 데이터 생성 완료");
	console.log(`계정: ${users.length}개`);
	console.log(`게시글: ${posts.length}개`);
	console.log(`댓글: ${totalCommentCount}개`);
	console.log(`답글: ${totalReplyCount}개`);
	console.log(`좋아요: ${totalLikeCount}개`);
	console.log(`조회 기록: ${totalViewRowCount}개`);
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