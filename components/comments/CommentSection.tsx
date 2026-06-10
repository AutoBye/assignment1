// Next.js는 "use client" 파일의 props가 Server Component에서 Client Component로 넘어올 수 있다고 보고, props가 직렬화 가능해야 한다고 검사함
// 함수는 직렬화할 수 없기 때문에 TS71007이 발생
import type { SubmitEventHandler } from "react";
import { useComments } from "@/lib/use-comments";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CommentPaginationResponse } from "@/types/api";
import type { CommentItem } from "@/types/comment";
import {CommentPagination} from "@/components/comments/CommentPagination";
import {CommentForm} from "@/components/comments/CommentForm";
import {CommentItemCard} from "@/components/comments/CommentItemCard";

type CommentSectionProps = {
  postId: string;
  initialComments: CommentItem[];
  initialPagination: CommentPaginationResponse;
  onCommentCountChange?: (amount: number) => void;
};

//  1. 사용자가 댓글 작성 버튼 클릭
//   2. handleSubmit 실행
//   3. commentsState.createComment() 실행
//   4. useComments 내부에서 API 요청
//   5. isSubmitting이 true가 됨
//   6. 버튼 문구/disabled 상태 변경
//   7. 성공하면 댓글 목록 다시 불러옴
//   8. comments state 변경
//   9. 댓글 목록 UI 다시 렌더링
export default function CommentSection({
  postId,
  initialComments,
  initialPagination,
  onCommentCountChange,
}: CommentSectionProps) {
  //  이건 “다른 곳에서 상태를 가져오는 것”처럼 보이지만, 실제로는:
  //   > CommentSection 안에서 댓글 관련 state와 함수들을 만들어 쓰는 것이다.
  // 그래서 useComments 의 state가 바뀌면 CommentSection이 다시 렌더링 되는것
  // 묶어봄
  const commentsState = useComments({
    postId,
    initialComments,
    initialPagination,
    onCommentCountChange,
  });

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    await commentsState.createComment();
  };

  // 많이 기네?
  // 라이브러리로 짤라서 진짜 많이 줄이긴 한듯.
  // 전에 보기 너무 불편
  // 그래서 분리 해봄
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>댓글</CardTitle>
        <p className="text-sm text-muted-foreground">
          일반 댓글 {commentsState.totalRootCommentCount}개
        </p>
      </CardHeader>

      <CardContent>
        <CommentForm
          content={commentsState.content}
          isSubmitting={commentsState.isSubmitting}
          onContentChange={commentsState.setContent}
          onSubmit={handleSubmit}
        />

        {commentsState.message && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{commentsState.message}</AlertDescription>
          </Alert>
        )}

        {commentsState.isLoading ? (
          <p className="text-sm text-muted-foreground">
            댓글을 불러오는 중입니다.
          </p>
        ) : commentsState.comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            아직 작성된 댓글이 없습니다.
          </p>
        ) : (
          <div className="space-y-4">
            {commentsState.comments.map((comment) => (
              <CommentItemCard
                key={comment.id}
                comment={comment}
                editingCommentId={commentsState.editingCommentId}
                editingContent={commentsState.editingContent}
                updatingCommentId={commentsState.updatingCommentId}
                deletingCommentId={commentsState.deletingCommentId}
                replyingToCommentId={commentsState.replyingToCommentId}
                replyContent={commentsState.replyContent}
                submittingReplyParentId={commentsState.submittingReplyParentId}
                onStartEdit={commentsState.startEditComment}
                onCancelEdit={commentsState.cancelEditComment}
                onUpdate={commentsState.updateComment}
                onDelete={commentsState.deleteComment}
                onStartReply={commentsState.startReply}
                onCancelReply={commentsState.cancelReply}
                onCreateReply={commentsState.createReply}
                onEditingContentChange={commentsState.setEditingContent}
                onReplyContentChange={commentsState.setReplyContent}
              />
            ))}
          </div>
        )}

        <CommentPagination
          currentPage={commentsState.currentPage}
          totalPages={commentsState.totalPages}
          isLoading={commentsState.isLoading}
          onPageChange={commentsState.loadComments}
        />
      </CardContent>
    </Card>
  );
}
