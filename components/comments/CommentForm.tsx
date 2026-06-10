import { SubmitEventHandler } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {useCurrentUser} from "@/components/providers/CurrentUserProvider";

type CommentFormProps = {
  content: string;
  isSubmitting: boolean;
  onContentChange: (content: string) => void;
  onSubmit: SubmitEventHandler<HTMLFormElement>;
};

export function CommentForm({
  content,
  isSubmitting,
  onContentChange,
  onSubmit,
}: CommentFormProps) {

	const { currentUser } = useCurrentUser();

	if (!currentUser) {
		return (
			<div className="mb-6 rounded-md border bg-muted p-4 text-sm text-muted-foreground">
				댓글을 작성하려면 로그인이 필요합니다.
			</div>
		);
	}

	return (
		<form onSubmit={onSubmit} className="mb-6 space-y-3">
			<div>
				<label htmlFor="comment" className="mb-1 block text-sm font-medium">
					댓글 작성
				</label>

				<Textarea
					id="comment"
					value={content}
					onChange={(event) => onContentChange(event.target.value)}
					className="min-h-24 resize-y"
					placeholder="댓글을 입력하세요."
				/>

				<p className="mt-1 text-xs text-muted-foreground">
					댓글은 2자 이상 500자 이하로 입력해주세요.
				</p>
			</div>

			<Button type="submit" disabled={isSubmitting}>
				{isSubmitting ? "작성 중..." : "댓글 작성"}
			</Button>
		</form>
	);
}
