"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { getErrorMessage } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";
import { togglePostBookmarkRequest } from "@/lib/queries/posts-query";
import { useErrorModalStore } from "@/lib/stores/error-modal-store";

type BookmarkButtonProps = {
  postId: string;
  bookmarked: boolean;
  bookmarkCount: number;
  onBookmarkChangeAction?: (bookmarkCount: number, bookmarked: boolean) => void;
};

export default function BookmarkButton({
  postId,
  bookmarked,
  bookmarkCount,
  onBookmarkChangeAction,
}: BookmarkButtonProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const { isLoggedIn, isLoading: isCurrentUserLoading } = useCurrentUser();
  const openErrorModal = useErrorModalStore((state) => state.openErrorModal);

  async function handleClick() {
    if (isCurrentUserLoading) {
      return;
    }

    if (!isLoggedIn) {
      openErrorModal("북마크를 사용하려면 로그인이 필요합니다.");
      return;
    }

    setIsLoading(true);

    try {
      const data = await togglePostBookmarkRequest(postId);

      onBookmarkChangeAction?.(data.bookmarkCount, data.bookmarked);

      await queryClient.invalidateQueries({
        queryKey: queryKeys.me.bookmarks,
      });
    } catch (error) {
      openErrorModal(
        getErrorMessage(error, "북마크 요청 중 오류가 발생했습니다."),
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
