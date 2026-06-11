import "server-only";

import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { isUUID } from "@/lib/validators";

type RequestHeaders = {
  get(name: string): string | null;
};

type RecordPostViewInput = {
  postId: string;
  currentUserId?: string;
  headers: RequestHeaders;
};

function hashValue(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function getClientIp(headers: RequestHeaders) {
  const forwardedFor = headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return headers.get("x-real-ip") ?? "unknown";
}

function getViewDataBucket() {
  return new Date().toISOString().slice(0, 10);
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function recordPostView({
  postId,
  currentUserId,
  headers,
}: RecordPostViewInput) {
  if (!isUUID(postId)) {
    return {
      recorded: false,
      reason: "invalid_post_id",
    };
  }

  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    select: {
      id: true,
      authorId: true,
    },
  });

  if (!post) {
    return {
      recorded: false,
      reason: "post_not_found",
    };
  }

  // 작성자 본인 조회는 조회수 제외
  if (currentUserId && post.authorId === currentUserId) {
    return {
      recoded: false,
      reason: "author_view",
    };
  }

  const ip = getClientIp(headers);
  const userAgent = headers.get("user-agent") ?? "unknown";
  const viewDataBucket = getViewDataBucket();

  const viewerType = currentUserId ? "user" : "anonymous";
  const viewerSource = currentUserId
    ? `user:${currentUserId}`
    : `anonymous${ip}:${userAgent}`;

  const viewerHash = hashValue(viewerSource);
  const ipHash = currentUserId ? null : hashValue(ip);
  const dedupeKey = hashValue(`${postId}:${viewerHash}:${viewDataBucket}`);

  try {
	  await prisma.$transaction([
		  prisma.postView.create({
			  data: {
				  postId,
				  userId: currentUserId,
				  viewerHash,
				  dedupeKey,
				  viewerType,
				  ipHash,
				  userAgent: userAgent.slice(0, 255),
			  },
		  }),
		  prisma.post.update({
			  where: {
				  id: postId,
			  },
			  data: {
				  viewCount: {
					  increment: 1,
				  },
			  },
		  }),
	  ]);

	  return {
		  recorded: true,
		  reason: "recorded",
	  };
  } catch (error) {
	  if (isUniqueConstraintError(error)) {
		  return {
			  recorded: false,
			  reason: "duplicated_view",
		  };
	  }

	  throw error;
  }
}
