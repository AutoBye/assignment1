import { memo } from "react";
import type { PostDetail } from "@/types/post";
import { formatDate } from "@/lib/date";

type PostDetailMetaProps = {
  post: PostDetail;
};

function PostDetailMeta({ post }: PostDetailMetaProps) {
  return (
    <div className="mb-6 border-b pb-4 text-sm text-muted-foreground">
      <p>작성자 {post.author.name}</p>
      <p>작성일 {formatDate(post.createdAt)}</p>
      <p>수정일 {formatDate(post.updatedAt)}</p>
      <p>
        조회수 {post.viewCount} · 좋아요 {post.likeCount}개 · 댓글{" "}
        {post.commentCount}개 · 북마크 {post.bookmarkCount}개
      </p>
    </div>
  );
}

export default memo(PostDetailMeta);
