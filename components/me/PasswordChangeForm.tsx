"use client";

import { SubmitEventHandler, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {useErrorModalStore} from "@/lib/stores/error-modal-store";
import {useToastStore} from "@/lib/stores/toast-store";
import {updateMyPassword} from "@/lib/queries/me-query";

export default function PasswordChangeForm() {
  const openErrorModal = useErrorModalStore((state) => state.openErrorModal);
  const showToast = useToastStore((state) => state.showToast);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (!currentPassword || !newPassword) {
      openErrorModal("현재 비밀번호와 새 비밀번호를 모두 입력해주세요.");
      return;
    }

    if (newPassword.length < 8) {
      openErrorModal("새 비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    if (currentPassword === newPassword) {
      openErrorModal("새 비밀번호는 현재 비밀번호와 달라야 합니다.");
      return;
    }

    setIsLoading(true);
    try {
      const data = await updateMyPassword({
        currentPassword,
        newPassword,
      });

      showToast({
        type: "success",
        message: data.message,
      });

      setCurrentPassword("");
      setNewPassword("");
    } catch {
      openErrorModal("비밀번호 변경 요청 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>비밀번호 변경</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="currentPassword"
              className="mb-1 block text-sm font-medium"
            >
              현재 비밀번호
            </label>

            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
              placeholder="********"
            />
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="mb-1 block text-sm font-medium"
            >
              새 비밀번호
            </label>

            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              placeholder="********"
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "변경 중..." : "비밀번호 변경"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
