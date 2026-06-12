"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api/client";
import { logoutRequest } from "@/lib/queries/auth-query";
import { queryKeys } from "@/lib/query-keys";
import { useErrorModalStore } from "@/lib/stores/error-modal-store";
import {currentUserQueryKey} from "@/lib/hooks/use-current-user-query";

export default function LogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const openErrorModal = useErrorModalStore((state) => state.openErrorModal);

  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      await logoutRequest();

      queryClient.setQueryData(currentUserQueryKey, {
        user: null,
      });

      queryClient.removeQueries({
        queryKey: queryKeys.me.all,
        exact: false,
      });

      queryClient.removeQueries({
        queryKey: queryKeys.comments.all,
        exact: false,
      });

      router.replace("/");
      router.refresh();
    } catch (error) {
      openErrorModal(
        getErrorMessage(error, "로그아웃 요청 중 오류가 발생했습니다."),
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 md:flex-row">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleLogout}
        disabled={isLoading}
      >
        {isLoading ? "로그아웃 중..." : "로그아웃"}
      </Button>
    </div>
  );
}
