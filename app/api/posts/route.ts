import { NextRequest } from "next/server";
import { jsonSuccess } from "@/lib/server/api-response";
import { POSTS_PER_PAGE } from "@/lib/constants";
import { getPosts } from "@/lib/services/post-read.service";
import { getPositivePageNumber } from "@/lib/validations/common";
import { requireCurrentUser } from "@/lib/server/auth-guard";
import { toRouteErrorResponse } from "@/lib/server/route-error";
import { createPost } from "@/lib/services/post-write.service";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedPage = getPositivePageNumber(searchParams.get("page"));
    const query = searchParams.get("q") ?? "";

    const result = await getPosts(requestedPage, query);

    return jsonSuccess({
      posts: result.posts,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalPostCount: result.totalPostCount,
        postsPerPage: POSTS_PER_PAGE,
      },
    });
  } catch (error) {
    return toRouteErrorResponse(
      error,
      "게시글 목록 조회 중 오류가 발생했습니다.",
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireCurrentUser();
    const body = await request.json();

    const result = await createPost(body, currentUser.id);

    return jsonSuccess(result, 201);
  } catch (error) {
    return toRouteErrorResponse(error, "게시글 작성 중 오류가 발생했습니다.");
  }
}
