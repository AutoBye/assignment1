import { useState } from "react";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { Button } from "@/components/ui/button";
import type { LikeButtonResponse } from "@/types/post";
import { useErrorModalStore } from "@/lib/stores/error-modal-store";

type LikeButtonProps = {
  postId: string;
  liked: boolean;
  likeCount: number;
  isOwnPost: boolean;
  onLikeChange?: (likeCount: number, liked: boolean) => void;
};

export default function LikeButton({
  postId,
  liked,
  likeCount,
  isOwnPost,
  onLikeChange,
}: LikeButtonProps) {
  // liked와 likeCount는 부모 상태를 기준으로 렌더링한다.
  const [isLoading, setIsLoading] = useState(false);
  const { isLoggedIn } = useCurrentUser();
  // selector을 쓴다.
  // store 전체를 구독하면 불필요한 리렌더링이 늘어남
  const openErrorModal = useErrorModalStore((state) => state.openErrorModal);

  async function handleClick() {
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
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
      });

      const data = (await response.json()) as LikeButtonResponse;

      if (!response.ok) {
        openErrorModal(data.message ?? "좋아요 처리에 실패했습니다.");
        return;
      }

      if (
        typeof data.liked !== "boolean" ||
        typeof data.likeCount !== "number"
      ) {
        openErrorModal("좋아요 응답이 올바르지 않습니다.");
        return;
      }

      onLikeChange?.(data.likeCount, data.liked);
    } catch {
      openErrorModal("좋아요 요청 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
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
    </div>
  );
}
