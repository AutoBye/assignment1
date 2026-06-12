import { memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CommentEditForm from "@/components/comments/CommentEditForm";
import CommentMeta from "@/components/comments/CommentMeta";
import type { CommentItem } from "@/types/comment";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";

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

export const CommentReplyCard = memo(function CommentReplyCard({
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

  const isAuthor = currentUser?.id === reply.author.id;
  const isEditing = editingCommentId === reply.id;
  const isUpdating = updatingCommentId === reply.id;
  const isDeleting = deletingCommentId === reply.id;

  const handleStartEdit = useCallback(() => {
    onStartEdit(reply);
  }, [onStartEdit, reply]);

  const handleUpdate = useCallback(() => {
    onUpdate(reply.id);
  }, [onUpdate, reply.id]);

  const handleDelete = useCallback(() => {
    onDelete(reply.id);
  }, [onDelete, reply.id]);

  return (
    <Card>
      <CardContent className="p-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <CommentMeta authorName={reply.author.name} createdAt={reply.createdAt} />

          {isAuthor && !isEditing && (
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={handleStartEdit}>
                수정
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </Button>
            </div>
          )}
        </div>

        {isEditing ? (
          <CommentEditForm
            content={editingContent}
            isUpdating={isUpdating}
            minHeightClassName="min-h-20"
            onContentChange={onEditingContentChange}
            onCancel={onCancelEdit}
            onSubmit={handleUpdate}
          />
        ) : (
          <p className="whitespace-pre-wrap text-sm text-foreground">
            {reply.content}
          </p>
        )}
      </CardContent>
    </Card>
  );
});
