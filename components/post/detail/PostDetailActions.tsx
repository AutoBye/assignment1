import { memo } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import BookmarkButton from "@/components/post/BookmarkButton";
import LikeButton from "@/components/post/LikeButton";

type PostDetailActionsProps = {
  postId: string;
  isAuthor: boolean;
  isDeleting: boolean;
  liked: boolean;
  likeCount: number;
  bookmarked: boolean;
  bookmarkCount: number;
  onBack: () => void;
  onDelete: () => void;
  onLikeChange: (likeCount: number, liked: boolean) => void;
  onBookmarkChange: (bookmarkCount: number, bookmarked: boolean) => void;
};

function PostDetailActions({
  postId,
  isAuthor,
  isDeleting,
  liked,
  likeCount,
  bookmarked,
  bookmarkCount,
  onBack,
  onDelete,
  onLikeChange,
  onBookmarkChange,
}: PostDetailActionsProps) {
  return (
    <div className="mt-6 flex flex-wrap gap-2 border-t pt-4">
      <Button type="button" variant="outline" onClick={onBack}>
        이전으로
      </Button>

      <Link href="/posts" className={buttonVariants()}>
        목록으로
      </Link>

      <LikeButton
        postId={postId}
        liked={liked}
        likeCount={likeCount}
        isOwnPost={isAuthor}
        onLikeChangeAction={onLikeChange}
      />

      <BookmarkButton
        postId={postId}
        bookmarked={bookmarked}
        bookmarkCount={bookmarkCount}
        onBookmarkChangeAction={onBookmarkChange}
      />

      {isAuthor && (
        <Link
          href={`/posts/${postId}/edit`}
          className={buttonVariants({ variant: "outline" })}
        >
          수정
        </Link>
      )}

      {isAuthor && (
        <Button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          variant="destructive"
        >
          {isDeleting ? "삭제 중..." : "삭제"}
        </Button>
      )}
    </div>
  );
}

export default memo(PostDetailActions);
