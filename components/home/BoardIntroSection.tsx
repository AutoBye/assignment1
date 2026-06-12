//메인 소개 영역
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function BoardIntroSection() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-2xl">게시판 프로젝트</CardTitle>
        <CardDescription>
          게시글, 댓글, 좋아요, 북마크 기능을 연습하는 과제용 웹 페이지입니다.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex gap-2">
          <Link href="/posts" className={buttonVariants()}>
            게시글 보기
          </Link>

          <Link
            href="/posts/new"
            className={buttonVariants({ variant: "outline" })}
          >
            글쓰기
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
