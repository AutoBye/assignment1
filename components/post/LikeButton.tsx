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

export default function LikeButton({
  postId,
  initialLiked,
  initialLikeCount,
  isLoggedIn,
  isOwnPost,
  onLikeChange,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setMessage("");

    if (!isLoggedIn) {
      setMessage("좋아요를 누르려면 로그인이 필요합니다.");
      return;
    }

    if (isOwnPost) {
      setMessage("자신이 작성한 글에는 좋아요를 누를 수 없습니다.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
      });

      const data = (await response.json()) as LikeButtonResponse;

      if (!response.ok) {
        setMessage(data.message ?? "좋아요 처리에 실패했습니다.");
        return;
      }

      if (
        typeof data.liked !== "boolean" ||
        typeof data.likeCount !== "number"
      ) {
        setMessage("좋아요 응답이 올바르지 않습니다.");
        return;
      }

      setLiked(data.liked);
      setLikeCount(data.likeCount);
      onLikeChange?.(data.likeCount, data.liked);
    } catch {
      setMessage("좋아요 요청 중 오류가 발생했습니다.");
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

      {message && (
        <Alert variant="destructive">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
