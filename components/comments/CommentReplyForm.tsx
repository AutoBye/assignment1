import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type CommentReplyFormProps = {
  content: string;
  isSubmitting: boolean;
  onContentChange: (content: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
};

function CommentReplyForm({
  content,
  isSubmitting,
  onContentChange,
  onCancel,
  onSubmit,
}: CommentReplyFormProps) {
  return (
    <div className="mt-4 rounded-md border bg-muted p-3">
      <label className="mb-1 block text-sm font-medium">답글 작성</label>

      <Textarea
        value={content}
        onChange={(event) => onContentChange(event.target.value)}
        className="min-h-20 resize-y bg-background text-sm"
        placeholder="답글을 입력하세요"
      />

      <div className="mt-2 flex gap-2">
        <Button type="button" size="sm" onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? "작성 중..." : "답글 작성"}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          취소
        </Button>
      </div>
    </div>
  );
}

export default memo(CommentReplyForm);
