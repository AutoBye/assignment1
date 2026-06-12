import { memo } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PostNotFoundCardProps = {
  onBack: () => void;
};

function PostNotFoundCard({ onBack }: PostNotFoundCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">게시글 조회 실패</CardTitle>
        <CardDescription>
          게시글을 찾을 수 없거나 올바르지 않은 게시글 ID입니다.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onBack}>
            이전으로
          </Button>

          <Link href="/posts" className={buttonVariants()}>
            목록으로
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(PostNotFoundCard);
