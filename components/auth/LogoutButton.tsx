"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/auth/logout`, {
        method: "POST",
      });

      if (!response.ok) {
        alert("로그아웃에 실패했습니다.");
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      alert("로그아웃 요청 중 오류가 발생했습니다.");
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
