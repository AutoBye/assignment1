import { memo, useCallback } from "react";
import type { CommentItem } from "@/types/comment";
import { CommentReplyCard } from "@/components/comments/CommentReplyCard";
import CommentEditForm from "@/components/comments/CommentEditForm";
import CommentMeta from "@/components/comments/CommentMeta";
import CommentReplyForm from "@/components/comments/CommentReplyForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";

type CommentItemCardProps = {
  comment: CommentItem;
  editingCommentId: string | null;
  editingContent: string;
  updatingCommentId: string | null;
  deletingCommentId: string | null;
  replyingToCommentId: string | null;
  replyContent: string;
  submittingReplyParentId: string | null;
  onStartEdit: (comment: CommentItem) => void;
  onCancelEdit: () => void;
  onUpdate: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  onStartReply: (commentId: string) => void;
  onCancelReply: () => void;
  onCreateReply: (parentId: string) => void;
  onEditingContentChange: (content: string) => void;
  onReplyContentChange: (content: string) => void;
};

export const CommentItemCard = memo(function CommentItemCard({
  comment,
  editingCommentId,
  editingContent,
  updatingCommentId,
  deletingCommentId,
  replyingToCommentId,
  replyContent,
  submittingReplyParentId,
  onStartEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  onStartReply,
  onCancelReply,
  onCreateReply,
  onEditingContentChange,
  onReplyContentChange,
}: CommentItemCardProps) {
  const { currentUser } = useCurrentUser();

  const isAuthor = currentUser?.id === comment.author.id;
  const isEditing = editingCommentId === comment.id;
  const isUpdating = updatingCommentId === comment.id;
  const isDeleting = deletingCommentId === comment.id;
  const isReplying = replyingToCommentId === comment.id;
  const isSubmittingReply = submittingReplyParentId === comment.id;

  const handleStartEdit = useCallback(() => {
    onStartEdit(comment);
  }, [comment, onStartEdit]);

  const handleUpdate = useCallback(() => {
    onUpdate(comment.id);
  }, [comment.id, onUpdate]);

  const handleDelete = useCallback(() => {
    onDelete(comment.id);
  }, [comment.id, onDelete]);

  const handleStartReply = useCallback(() => {
    onStartReply(comment.id);
  }, [comment.id, onStartReply]);

  const handleCreateReply = useCallback(() => {
    onCreateReply(comment.id);
  }, [comment.id, onCreateReply]);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <CommentMeta authorName={comment.author.name} createdAt={comment.createdAt} />

          <div className="flex gap-2">
            {currentUser && !isEditing && (
              <Button type="button" variant="ghost" size="sm" onClick={handleStartReply}>
                답글
              </Button>
            )}

            {isAuthor && !isEditing && (
              <>
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
              </>
            )}
          </div>
        </div>

        {isEditing ? (
          <CommentEditForm
            content={editingContent}
            isUpdating={isUpdating}
            onContentChange={onEditingContentChange}
            onCancel={onCancelEdit}
            onSubmit={handleUpdate}
          />
        ) : (
          <p className="whitespace-pre-wrap text-sm text-foreground">
            {comment.content}
          </p>
        )}

        {isReplying && (
          <CommentReplyForm
            content={replyContent}
            isSubmitting={isSubmittingReply}
            onContentChange={onReplyContentChange}
            onCancel={onCancelReply}
            onSubmit={handleCreateReply}
          />
        )}

        {comment.replies.length > 0 && (
          <div className="mt-4 space-y-3 border-l pl-4">
            {comment.replies.map((reply) => (
              <CommentReplyCard
                key={reply.id}
                reply={reply}
                editingCommentId={editingCommentId}
                editingContent={editingContent}
                updatingCommentId={updatingCommentId}
                deletingCommentId={deletingCommentId}
                onStartEdit={onStartEdit}
                onCancelEdit={onCancelEdit}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onEditingContentChange={onEditingContentChange}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});
