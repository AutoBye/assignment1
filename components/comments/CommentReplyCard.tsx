import { formatDate } from "@/lib/date";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { CommentItem } from "@/types/comment";
import {useCurrentUser} from "@/components/providers/CurrentUserProvider";

type CommentReplyCardProps = {
  reply: CommentItem;
  editingCommentId: string | null;
  editingContent: string;
  updatingCommentId: string | null;
  deletingCommentId: string | null;
  onStartEdit: (comment: CommentItem) => void;
  onCancelEdit: () => void;
  onUpdate: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  onEditingContentChange: (content: string) => void;
};

export function CommentReplyCard({
  reply,
  editingCommentId,
  editingContent,
  updatingCommentId,
  deletingCommentId,
  onStartEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  onEditingContentChange,
}: CommentReplyCardProps) {
  const { currentUser } = useCurrentUser();
  const isReplyAuthor = currentUser?.id === reply.author.id;
  const isReplyEditing = editingCommentId === reply.id;
  const isReplyUpdating = updatingCommentId === reply.id;
  const isReplyDeleting = deletingCommentId === reply.id;

  return (
    <Card>
      <CardContent className="p-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {reply.author.name}
            </span>
            <span> · {formatDate(reply.createdAt)}</span>
          </div>

          {isReplyAuthor && !isReplyEditing && (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onStartEdit(reply)}
              >
                수정
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onDelete(reply.id)}
                disabled={isReplyDeleting}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                {isReplyDeleting ? "삭제 중..." : "삭제"}
              </Button>
            </div>
          )}
        </div>

        {isReplyEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editingContent}
              onChange={(event) => onEditingContentChange(event.target.value)}
              className="min-h-20 resize-y text-sm"
            />

            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => onUpdate(reply.id)}
                disabled={isReplyUpdating}
              >
                {isReplyUpdating ? "수정 중..." : "저장"}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancelEdit}
                disabled={isReplyUpdating}
              >
                취소
              </Button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm text-foreground">
            {reply.content}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
