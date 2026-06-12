"use client";

import { formatDate } from "@/lib/date";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {useCurrentUserQuery} from "@/lib/hooks/use-current-user-query";

type ProfileSummaryProps = {
  initialUser: {
    id: string;
    email: string;
    name: string;
    createdAt: Date | string;
  };
};

export default function ProfileSummary({ initialUser }: ProfileSummaryProps) {
  const { data } = useCurrentUserQuery();
  const currentUser = data?.user ?? initialUser;

  return (
    <Card>
      <CardHeader>
        <CardTitle>계정 정보</CardTitle>
      </CardHeader>

      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">이름</span>
          <span className="font-medium">{currentUser.name}</span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">이메일</span>
          <span className="font-medium">{currentUser.email}</span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">가입일</span>
          <span className="font-medium">
            {formatDate(currentUser.createdAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
