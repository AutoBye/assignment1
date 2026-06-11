import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BookmarkedPosts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>북마크한 게시글</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>아직 연결된 북마크 목록이 없습니다.</p>

          <Link
            href="/posts"
            className="text-primary underline-offset-4 hover:underline"
          >
            게시글 보러가기
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
