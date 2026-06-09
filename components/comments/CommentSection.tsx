// Next.js는 "use client" 파일의 props가 Server Component에서 Client Component로 넘어올 수 있다고 보고, props가 직렬화 가능해야 한다고 검사함
// 함수는 직렬화할 수 없기 때문에 TS71007이 발생
import type { SubmitEventHandler } from "react";
import { formatDate } from "@/lib/date";
import { useComments } from "@/lib/use-comments";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { CommentPaginationResponse } from "@/types/api";
import type { CurrentUser } from "@/types/auth";
import type { CommentItem } from "@/types/comment";

type CommentSectionProps = {
  postId: string;
  currentUser: CurrentUser | null;
  initialComments: CommentItem[];
  initialPagination: CommentPaginationResponse;
  onCommentCountChange?: (amount: number) => void;
};

export default function CommentSection({
  postId,
  currentUser,
  initialComments,
  initialPagination,
  onCommentCountChange,
}: CommentSectionProps) {

  const commentsState = useComments({
    postId,
    initialComments,
    initialPagination,
    onCommentCountChange,
  });

  const hasPreviousPage = commentsState.currentPage > 1;
  const hasNextPage = commentsState.currentPage < commentsState.totalPages;

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    await commentsState.createComment();
  };

  // 많이 기네?
  // 라이브러리로 짤라서 진짜 많이 줄이긴 한듯.
  // 전에 보기 너무 불편
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>댓글</CardTitle>
        <p className="text-sm text-muted-foreground">
          일반 댓글 {commentsState.totalRootCommentCount}개
        </p>
      </CardHeader>

      <CardContent>
        {currentUser ? (
          <form onSubmit={handleSubmit} className="mb-6 space-y-3">
            <div>
              <label
                htmlFor="comment"
                className="mb-1 block text-sm font-medium"
              >
                댓글 작성
              </label>

              <Textarea
                id="comment"
                value={commentsState.content}
                onChange={(event) =>
                  commentsState.setContent(event.target.value)
                }
                className="min-h-24 resize-y"
                placeholder="댓글을 입력하세요"
              />

              <p className="mt-1 text-xs text-muted-foreground">
                댓글은 2자 이상 500자 이하로 입력해주세요.
              </p>
            </div>

            <Button type="submit" disabled={commentsState.isSubmitting}>
              {commentsState.isSubmitting ? "작성 중..." : "댓글 작성"}
            </Button>
          </form>
        ) : (
          <div className="mb-6 rounded-md border bg-muted p-4 text-sm text-muted-foreground">
            댓글을 작성하려면 로그인이 필요합니다.
          </div>
        )}

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
            {commentsState.comments.map((comment) => {
              const isAuthor = currentUser?.id === comment.author.id;
              const isEditing = commentsState.editingCommentId === comment.id;
              const isUpdating = commentsState.updatingCommentId === comment.id;
              const isDeleting = commentsState.deletingCommentId === comment.id;
              const isReplying =
                commentsState.replyingToCommentId === comment.id;

              return (
                <Card key={comment.id}>
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
                            onClick={() => commentsState.startReply(comment.id)}
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
                              onClick={() =>
                                commentsState.startEditComment(comment)
                              }
                            >
                              수정
                            </Button>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                commentsState.deleteComment(comment.id)
                              }
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
                          value={commentsState.editingContent}
                          onChange={(event) =>
                            commentsState.setEditingContent(event.target.value)
                          }
                          className="min-h-24 resize-y text-sm"
                        />

                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() =>
                              commentsState.updateComment(comment.id)
                            }
                            disabled={isUpdating}
                          >
                            {isUpdating ? "수정 중..." : "저장"}
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={commentsState.cancelEditComment}
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
                        <label className="mb-1 block text-sm font-medium">
                          답글 작성
                        </label>

                        <Textarea
                          value={commentsState.replyContent}
                          onChange={(event) =>
                            commentsState.setReplyContent(event.target.value)
                          }
                          className="min-h-20 resize-y bg-background text-sm"
                          placeholder="답글을 입력하세요"
                        />

                        <div className="mt-2 flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() =>
                              commentsState.createReply(comment.id)
                            }
                            disabled={
                              commentsState.submittingReplyParentId ===
                              comment.id
                            }
                          >
                            {commentsState.submittingReplyParentId ===
                            comment.id
                              ? "작성 중..."
                              : "답글 작성"}
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={commentsState.cancelReply}
                            disabled={
                              commentsState.submittingReplyParentId ===
                              comment.id
                            }
                          >
                            취소
                          </Button>
                        </div>
                      </div>
                    )}

                    {comment.replies.length > 0 && (
                      <div className="mt-4 space-y-3 border-l pl-4">
                        {comment.replies.map((reply) => {
                          const isReplyAuthor =
                            currentUser?.id === reply.author.id;
                          const isReplyEditing =
                            commentsState.editingCommentId === reply.id;
                          const isReplyUpdating =
                            commentsState.updatingCommentId === reply.id;
                          const isReplyDeleting =
                            commentsState.deletingCommentId === reply.id;

                          return (
                            <Card key={reply.id}>
                              <CardContent className="p-3">
                                <div className="mb-2 flex items-center justify-between gap-3">
                                  <div className="text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">
                                      {reply.author.name}
                                    </span>
                                    <span>
                                      {" "}
                                      · {formatDate(reply.createdAt)}
                                    </span>
                                  </div>

                                  {isReplyAuthor && !isReplyEditing && (
                                    <div className="flex gap-2">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          commentsState.startEditComment(reply)
                                        }
                                      >
                                        수정
                                      </Button>

                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          commentsState.deleteComment(reply.id)
                                        }
                                        disabled={isReplyDeleting}
                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                      >
                                        {isReplyDeleting
                                          ? "삭제 중..."
                                          : "삭제"}
                                      </Button>
                                    </div>
                                  )}
                                </div>

                                {isReplyEditing ? (
                                  <div className="space-y-2">
                                    <Textarea
                                      value={commentsState.editingContent}
                                      onChange={(event) =>
                                        commentsState.setEditingContent(
                                          event.target.value,
                                        )
                                      }
                                      className="min-h-20 resize-y text-sm"
                                    />

                                    <div className="flex gap-2">
                                      <Button
                                        type="button"
                                        size="sm"
                                        onClick={() =>
                                          commentsState.updateComment(reply.id)
                                        }
                                        disabled={isReplyUpdating}
                                      >
                                        {isReplyUpdating
                                          ? "수정 중..."
                                          : "저장"}
                                      </Button>

                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={
                                          commentsState.cancelEditComment
                                        }
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
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {commentsState.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                commentsState.loadComments(commentsState.currentPage - 1)
              }
              disabled={!hasPreviousPage || commentsState.isLoading}
            >
              이전
            </Button>

            <span className="px-3 py-2 text-sm text-muted-foreground">
              {commentsState.currentPage} / {commentsState.totalPages}
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                commentsState.loadComments(commentsState.currentPage + 1)
              }
              disabled={!hasNextPage || commentsState.isLoading}
            >
              다음
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
