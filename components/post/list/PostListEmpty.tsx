import { memo } from "react";

type PostListEmptyProps = {
  hasQuery: boolean;
};

function PostListEmpty({ hasQuery }: PostListEmptyProps) {
  return (
    <p className="text-sm text-muted-foreground">
      {hasQuery ? "검색 결과가 없습니다." : "아직 작성된 게시글이 없습니다."}
    </p>
  );
}

export default memo(PostListEmpty);
