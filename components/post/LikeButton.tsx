"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { getErrorMessage } from "@/lib/api/client";
import { togglePostLikeRequest } from "@/lib/requests/createPostRequest";
import { useErrorModalStore } from "@/lib/stores/error-modal-store";

type LikeButtonProps = {
  postId: string;
  liked: boolean;
  likeCount: number;
  isOwnPost: boolean;
  onLikeChangeAction?: (likeCount: number, liked: boolean) => void;
};

export default function LikeButton({
  postId,
  liked,
  likeCount,
  isOwnPost,
  onLikeChangeAction,
}: LikeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { isLoggedIn, isLoading: isCurrentUserLoading } = useCurrentUser();
  const openErrorModal = useErrorModalStore((state) => state.openErrorModal);

  async function handleClick() {
    if (isCurrentUserLoading) {
      return;
    }

    if (!isLoggedIn) {
      openErrorModal("좋아요를 누르려면 로그인이 필요합니다.");
      return;
    }

    if (isOwnPost) {
      openErrorModal("자신이 작성한 글에는 좋아요를 누를 수 없습니다.");
      return;
    }

    setIsLoading(true);

    try {
      const data = await togglePostLikeRequest(postId);
      onLikeChangeAction?.(data.likeCount, data.liked);
    } catch (error) {
      openErrorModal(
        getErrorMessage(error, "좋아요 요청 중 오류가 발생했습니다."),
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isLoading || isCurrentUserLoading}
      variant="outline"
      className={
        liked
          ? "border-primary/50 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
          : "hover:border-primary/40 hover:bg-primary/5"
      }
    >
      {isLoading
        ? "처리 중..."
        : liked
          ? `좋아요 취소 ${likeCount}`
          : `좋아요 ${likeCount}`}
    </Button>
  );
}
