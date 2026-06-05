"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	async function handleLogout() {
		setIsLoading(true);

		try {
			const response = await fetch("/api/auth/logout", {
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
		<button
			type="button"
			onClick={handleLogout}
			disabled={isLoading}
			className="text-sm disabled:text-gray-400"
		>
			{isLoading ? "로그아웃 중..." : "로그아웃"}
		</button>
	);
}