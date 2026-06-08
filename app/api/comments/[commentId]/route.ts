import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type CommentRouteContext = {
  params: Promise<{
    commentId: string;
  }>;
};

type UpdateCommentRequestBody = {
	content?: unknown;
};

function isUUID(value: unknown) {
	if (typeof value !== "string") {
		return false;
	}

	return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
		value,
	);
}

function getStringValue(value: unknown) {
	if (typeof value !== "string") {
		return "";
	}

	return value.trim();
}

// DELETE /api/comments/[commentId]
// -> 로그인 확인
// -> 댓글 존재 확인
// -> 댓글 작성자 본인인지 확인
// -> 댓글 삭제
export async function DELETE(
  _request: NextRequest,
  { params }: CommentRouteContext,
) {
  try {
    const currentUser = await getCurrentUser();

	//로그인 필요
    if (!currentUser) {
      return NextResponse.json(
        {
          message: "로그인이 필요합니다.",
        },
        {
          status: 401,
        },
      );
    }

	// UUID 체크
    const { commentId } = await params;
    if (!isUUID(commentId)) {
      return NextResponse.json(
        {
          message: "올바르지 않은 댓글 ID입니다.",
        },
        {
          status: 400,
        },
      );
    }

	// 댓글 여부
    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
      select: {
        id: true,
        authorId: true,
      },
    });
    if (!comment) {
      return NextResponse.json(
        {
          message: "댓글을 찾을 수 없습니다.",
        },
        {
          status: 404,
        },
      );
    }

	// 권한 체크
    if (comment.authorId !== currentUser.id) {
      return NextResponse.json(
        {
          message: "댓글을 삭제할 권한이 없습니다.",
        },
        {
          status: 403,
        },
      );
    }

	// 삭제 실행
    await prisma.comment.delete({
      where: {
        id: comment.id,
      },
    });

    return NextResponse.json({
      message: "댓글이 삭제되었습니다.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "댓글 삭제 중 오류가 발생했습니다.",
      },
      {
        status: 500,
      },
    );
  }
}


// PATCH /api/comments/[commentId]
// -> 로그인 확인
// -> 댓글 존재 확인
// -> 댓글 작성자 본인인지 확인
// -> 댓글 내용 검사
// -> 댓글 수정
export async function PATCH(
	request: NextRequest,
	{ params } : CommentRouteContext,
) {
	try {
		const currentUser = await getCurrentUser();

		//로그인 필요
		if (!currentUser) {
			return NextResponse.json(
				{
					message: "로그인이 필요합니다.",
				},
				{
					status: 401,
				},
			);
		}

		// UUID 체크
		const { commentId } = await params;
		if (!isUUID(commentId)) {
			return NextResponse.json(
				{
					message: "올바르지 않은 댓글 ID입니다.",
				},
				{
					status: 400,
				},
			);
		}

		// 내용 검증
		const body = (await request.json()) as UpdateCommentRequestBody;
		const content = getStringValue(body.content);
		if (!content) {
			return NextResponse.json(
				{
					message: "댓글 내용을 입력해주세요.",
				},
				{
					status: 400,
				},
			);
		}
		if (content.length < 2 || content.length > 1000) {
			return NextResponse.json(
				{
					message: "댓글은 2자 이상 1000자 이하로 입력해주세요.",
				},
				{
					status: 400,
				},
			);
		}

		// 댓글 찾기
		const comment = await prisma.comment.findUnique({
			where: {
				id: commentId,
			},
			select: {
				id: true,
				authorId: true,
			},
		});

		// 있는 댓글?
		if (!comment) {
			return NextResponse.json(
				{
					message: "댓글을 찾을 수 없습니다.",
				},
				{
					status: 404,
				},
			);
		}

		// 권한 확인
		if (comment.authorId !== currentUser.id) {
			return NextResponse.json(
				{
					message: "댓글을 수정할 권한이 없습니다.",
				},
				{
					status: 403,
				},
			);
		}

		// 수정 실행
		const updatedComment = await prisma.comment.update({
			where: {
				id: comment.id,
			},
			data: {
				content,
			},
			select: {
				id: true,
				content: true,
				createdAt: true,
				updatedAt: true,
				author: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});

		return NextResponse.json({
			message: "댓글이 수정되었습니다.",
			comment: updatedComment,
		});
	} catch (error) {
		console.log(error);
	} finally {

	}
}