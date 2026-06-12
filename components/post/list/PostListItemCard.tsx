import { memo } from "react";
import Link from "next/link";
import type { PostListItem } from "@/types/post";

type PostListItemCardProps = {
  post: PostListItem;
};

function PostListItemCard({ post }: PostListItemCardProps) {
  return (
    <article>
      <Link
        href={`/posts/${post.id}`}
        className="interactive-card group block cursor-pointer focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
      >
        <h2 className="font-semibold transition-colors group-hover:text-primary">
          {post.title}
        </h2>

        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {post.content}
        </p>

        <div className="mt-3 text-sm text-muted-foreground">
          <p>
            작성자 {post.author.name} · 작성일 {post.createdAt}
          </p>

          <p>
            조회수 {post.viewCount}개 · 좋아요 {post.likeCount}개 · 댓글{" "}
            {post.commentCount}개 · 북마크 {post.bookmarkCount}개
          </p>
        </div>
      </Link>
    </article>
  );
}

export default memo(PostListItemCard);
