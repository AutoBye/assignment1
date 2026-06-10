import { formatDate } from "@/lib/date";
import { CommentItem } from "@/types/comment";
import { CurrentUser } from "@/types/auth";
import {CommentReplyCard} from "@/components/comments/CommentReplyCard";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Textarea} from "@/components/ui/textarea";

type CommentItemCardProps = {
  comment: CommentItem;
  currentUser: CurrentUser | null;
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

export function CommentItemCard({
  comment,
  currentUser,
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
  const isAuthor = currentUser?.id === comment.author.id;
  const isEditing = editingCommentId === comment.id;
  const isUpdating = updatingCommentId === comment.id;
  const isDeleting = deletingCommentId === comment.id;
  const isReplying = replyingToCommentId === comment.id;
  const isSubmittingReply = submittingReplyParentId === comment.id;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {comment.author.name}
            </span>
            <span> · {formatDate(comment.createdAt)}</span>
          </div>

          <div className="flex gap-2">
            {currentUser && !isEditing && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onStartReply(comment.id)}
              >
                답글
              </Button>
            )}

            {isAuthor && !isEditing && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onStartEdit(comment)}
                >
                  수정
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(comment.id)}
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
          <div className="space-y-2">
            <Textarea
              value={editingContent}
              onChange={(event) => onEditingContentChange(event.target.value)}
              className="min-h-24 resize-y text-sm"
            />

            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => onUpdate(comment.id)}
                disabled={isUpdating}
              >
                {isUpdating ? "수정 중..." : "저장"}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancelEdit}
                disabled={isUpdating}
              >
                취소
              </Button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm text-foreground">
            {comment.content}
          </p>
        )}

        {isReplying && (
          <div className="mt-4 rounded-md border bg-muted p-3">
            <label className="mb-1 block text-sm font-medium">답글 작성</label>

            <Textarea
              value={replyContent}
              onChange={(event) => onReplyContentChange(event.target.value)}
              className="min-h-20 resize-y bg-background text-sm"
              placeholder="답글을 입력하세요."
            />

            <div className="mt-2 flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => onCreateReply(comment.id)}
                disabled={isSubmittingReply}
              >
                {isSubmittingReply ? "작성 중..." : "답글 작성"}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancelReply}
                disabled={isSubmittingReply}
              >
                취소
              </Button>
            </div>
          </div>
        )}

        {comment.replies.length > 0 && (
          <div className="mt-4 space-y-3 border-l pl-4">
            {comment.replies.map((reply) => (
              <CommentReplyCard
                key={reply.id}
                reply={reply}
                currentUser={currentUser}
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
}
