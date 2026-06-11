"use client";

import { SubmitEventHandler, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CurrentUser } from "@/types/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useErrorModalStore } from "@/lib/stores/error-modal-store";
import { useToastStore } from "@/lib/stores/toast-store";
import { currentUserQueryKey } from "@/lib/use-current-user";

type ProfileFormProps = {
  currentUser: CurrentUser;
};

type ProfileUpdateResponse = {
  message: string;
  user?: CurrentUser;
};

export default function ProfileForm({ currentUser }: ProfileFormProps) {
  const queryClient = useQueryClient();
  const openErrorModal = useErrorModalStore((state) => state.openErrorModal);
  const showToast = useToastStore((state) => state.showToast);

  const [name, setName] = useState(currentUser.name);
  const [isLoading, setIsLoading] = useState(false);

  //const isUnchanged = name.trim() === currentUser.name;

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (trimmedName.length < 2 || trimmedName.length > 20) {
      openErrorModal("이름은 2자 이상 20자 이하로 입력해주세요.");
      return;
    }

    if (trimmedName === currentUser.name) {
      showToast({
        type: "info",
        message: "변경된 내용이 없습니다.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/me/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
        }),
      });

      const data = (await response.json()) as ProfileUpdateResponse;

      if (!response.ok) {
        openErrorModal(data.message ?? "프로필 수정에 실패했습니다.");
        return;
      }

      if (!data.user) {
        openErrorModal("프로필 응답이 올바르지 않습니다.");
        return;
      }

      queryClient.setQueryData(currentUserQueryKey, {
        user: data.user,
      });

      showToast({
        type: "success",
        message: data.message,
      });
    } catch {
      openErrorModal("프로필 수정 요청 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>프로필 수정</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              이름
            </label>
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              minLength={2}
              maxLength={20}
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "저장 중..." : "저장"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
