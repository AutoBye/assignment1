import { useState } from "react";
import { Bookmark } from "lucide-react";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { Button } from "@/components/ui/button";
import { useErrorModalStore } from "@/lib/stores/error-modal-store";
import type { BookmarkButtonResponse } from "@/types/post";
import {useQueryClient} from "@tanstack/react-query";
import {queryKeys} from "@/lib/query-keys";

type BookmarkButtonProps = {
  postId: string;
  bookmarked: boolean;
  bookmarkCount: number;
  onBookmarkChange?: (bookmarkCount: number, bookmarked: boolean) => void;
};

export default function BookmarkButton({
  postId,
  bookmarked,
  bookmarkCount,
  onBookmarkChange,
}: BookmarkButtonProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const { isLoggedIn } = useCurrentUser();
  const openErrorModal = useErrorModalStore((state) => state.openErrorModal);

  async function handleClick() {
    if (!isLoggedIn) {
      openErrorModal("북마크를 사용하려면 로그인이 필요합니다.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/posts/${postId}/bookmark`, {
        method: "POST",
      });

      const data = (await response.json()) as BookmarkButtonResponse;

      if (!response.ok) {
        openErrorModal(data.message ?? "북마크 처리에 실패했습니다.");
        return;
      }

      if (
        typeof data.bookmarked !== "boolean" ||
        typeof data.bookmarkCount !== "number"
      ) {
        openErrorModal("북마크 응답이 올바르지 않습니다.");
        return;
      }

      onBookmarkChange?.(data.bookmarkCount, data.bookmarked);

      await queryClient.invalidateQueries({
        queryKey: queryKeys.me.bookmarks,
      });
    } catch {
      openErrorModal("북마크 요청 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      variant="outline"
      className={
        bookmarked
          ? "border-primary/50 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
          : "hover:border-primary/40 hover:bg-primary/5"
      }
    >
      <Bookmark className={bookmarked ? "fill-current" : ""} />
      {isLoading
        ? "처리 중..."
        : bookmarked
          ? `북마크 취소 ${bookmarkCount}`
          : `북마크 ${bookmarkCount}`}
    </Button>
  );
}
