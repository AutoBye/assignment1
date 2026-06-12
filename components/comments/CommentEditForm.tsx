import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type CommentEditFormProps = {
  content: string;
  isUpdating: boolean;
  minHeightClassName?: string;
  onContentChange: (content: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
};

function CommentEditForm({
  content,
  isUpdating,
  minHeightClassName = "min-h-24",
  onContentChange,
  onCancel,
  onSubmit,
}: CommentEditFormProps) {
  return (
    <div className="space-y-2">
      <Textarea
        value={content}
        onChange={(event) => onContentChange(event.target.value)}
        className={`${minHeightClassName} resize-y text-sm`}
      />

      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={onSubmit} disabled={isUpdating}>
          {isUpdating ? "수정 중..." : "저장"}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isUpdating}
        >
          취소
        </Button>
      </div>
    </div>
  );
}

export default memo(CommentEditForm);
