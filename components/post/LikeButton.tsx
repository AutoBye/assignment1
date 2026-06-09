import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LikeButtonResponse } from "@/types/post";

type LikeButtonProps = {
  postId: string;
  initialLiked: boolean;
  initialLikeCount: number;
  isLoggedIn: boolean;
  isOwnPost: boolean;
  onLikeChange?: (likeCount: number, liked: boolean) => void;
};

type LikeState = {
  liked: boolean;
  likeCount: number;
  message: string;
  isLoading: boolean;
};

export default function LikeButton({
  postId,
  initialLiked,
  initialLikeCount,
  isLoggedIn,
  isOwnPost,
  onLikeChange,
}: LikeButtonProps) {
  const [likeState, setLikeState] = useState<LikeState>({
    liked: initialLiked,
    likeCount: initialLikeCount,
    message: "",
    isLoading: false,
  });

  async function handleClick() {
    if (!isLoggedIn) {
      setLikeState((currentState) => ({
        ...currentState,
        message: "좋아요를 누르려면 로그인이 필요합니다.",
      }));
      return;
    }

    if (isOwnPost) {
      setLikeState((currentState) => ({
        ...currentState,
        message: "자신이 작성한 글에는 좋아요를 누를 수 없습니다.",
      }));
      return;
    }

    setLikeState((currentState) => ({
      ...currentState,
      isLoading: true,
    }));

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
      });

      const data = (await response.json()) as LikeButtonResponse;

      if (!response.ok) {
        setLikeState((currentState) => ({
          ...currentState,
          message: "좋아요 처리에 실패했습니다.",
        }));
        return;
      }

      if (
        typeof data.liked !== "boolean" ||
        typeof data.likeCount !== "number"
      ) {
        setLikeState((currentState) => ({
          ...currentState,
          message: "좋아요 응답이 올바르지 않습니다.",
          isLoading: false,
        }));
        return;
      }

      setLikeState({
        liked: data.liked,
        likeCount: data.likeCount,
        message: "",
        isLoading: false,
      });

      onLikeChange?.(data.likeCount, data.liked);
    } catch {
      setLikeState((currentState) => ({
        ...currentState,
        message: "좋아요 요청 중 오류가 발생했습니다.",
        isLoading: false,
      }));
    } finally {
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        onClick={handleClick}
        disabled={likeState.isLoading}
        variant="outline"
        className={
          likeState.liked
            ? "border-primary/50 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
            : "hover:border-primary/40 hover:bg-primary/5"
        }
      >
        {likeState.isLoading
          ? "처리 중..."
          : likeState.liked
            ? `좋아요 취소 ${likeState.likeCount}`
            : `좋아요 ${likeState.likeCount}`}
      </Button>

      {likeState.message && (
        <Alert variant="destructive">
          <AlertDescription>{likeState.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
