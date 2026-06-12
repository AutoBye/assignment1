import { memo } from "react";
import { formatDate } from "@/lib/date";

type CommentMetaProps = {
  authorName: string;
  createdAt: string;
};

function CommentMeta({ authorName, createdAt }: CommentMetaProps) {
  return (
    <div className="text-sm text-muted-foreground">
      <span className="font-medium text-foreground">{authorName}</span>
      <span> · {formatDate(createdAt)}</span>
    </div>
  );
}

export default memo(CommentMeta);
