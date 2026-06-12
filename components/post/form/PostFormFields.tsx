import { memo } from "react";
import {
  POST_CONTENT_MIN_LENGTH,
  POST_TITLE_MAX_LENGTH,
  POST_TITLE_MIN_LENGTH,
} from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type PostFormFieldsProps = {
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
};

function PostFormFields({
  title,
  content,
  onTitleChange,
  onContentChange,
}: PostFormFieldsProps) {
  return (
    <>
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium">
          제목
        </label>

        <Input
          id="title"
          type="text"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="게시글 제목을 입력하세요"
          minLength={POST_TITLE_MIN_LENGTH}
          maxLength={POST_TITLE_MAX_LENGTH}
        />

        <p className="mt-1 text-xs text-muted-foreground">
          제목은 {POST_TITLE_MIN_LENGTH}자 이상 {POST_TITLE_MAX_LENGTH}자
          이하로 입력해주세요.
        </p>
      </div>

      <div>
        <label htmlFor="content" className="mb-1 block text-sm font-medium">
          내용
        </label>

        <Textarea
          id="content"
          value={content}
          onChange={(event) => onContentChange(event.target.value)}
          className="min-h-60 resize-y"
          placeholder="게시글 내용을 입력하세요"
        />

        <p className="mt-1 text-xs text-muted-foreground">
          내용은 {POST_CONTENT_MIN_LENGTH}자 이상 입력해주세요.
        </p>
      </div>
    </>
  );
}

export default memo(PostFormFields);
