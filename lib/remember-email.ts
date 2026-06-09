// auth.ts에서 떨어져나간 라이브러리
// 얘는 클라이언트꺼
"use client";

import { useSyncExternalStore } from "react";

const REMEMBER_EMAIL_KEY = "assignment1:remember-email";
const REMEMBER_EMAIL_CHANGE_EVENT = "remember-email-change";

// useState에 함수를 넘기면 그 함수는 컴포넌트 초기화 시 초기 state를 계산하는 initializer로 사용
// 반대로 useEffect 안에서 즉시 setState를 호출하면 불필요한 추가 렌더링이 발생할 수 있어 react-hooks/set-state-in-effect 규칙에 걸림
// useEffect 제거

// 클라이언트 컴포넌트는 서버 전용 환경변수 env 못쓰네?
// NEXT_PUBLIC 붙여아함....
// 근데 클라이언트에 노출된다는데 더 안전하게?
// 방식을 바꿔보자

function canUseLocalStorage() {
	return (
		typeof window !== "undefined" &&
		typeof window.localStorage !== "undefined"
	);
}

function notifyRememberEmailChange() {
	window.dispatchEvent(new Event(REMEMBER_EMAIL_CHANGE_EVENT));
}

export function getRememberedEmail() {
	if (!canUseLocalStorage()) {
		return "";
	}

	try {
		return window.localStorage.getItem(REMEMBER_EMAIL_KEY) ?? "";
	} catch {
		return "";
	}
}

export function getRememberEmailChecked() {
	if (!canUseLocalStorage()) {
		return false;
	}

	try {
		return window.localStorage.getItem(REMEMBER_EMAIL_KEY) !== null;
	} catch {
		return false;
	}
}

export function saveRememberedEmail(email: string) {
	if (!canUseLocalStorage()) {
		return false;
	}

	try {
		window.localStorage.setItem(REMEMBER_EMAIL_KEY, email);
		notifyRememberEmailChange();
		return true;
	} catch {
		return false;
	}
}

export function removeRememberedEmail() {
	if (!canUseLocalStorage()) {
		return false;
	}

	try {
		window.localStorage.removeItem(REMEMBER_EMAIL_KEY);
		notifyRememberEmailChange();
		return true;
	} catch {
		return false;
	}
}

function subscribeRememberEmail(callback: () => void) {
	window.addEventListener("storage", callback);
	window.addEventListener(REMEMBER_EMAIL_CHANGE_EVENT, callback);

	return () => {
		window.removeEventListener("storage", callback);
		window.removeEventListener(REMEMBER_EMAIL_CHANGE_EVENT, callback);
	};
}

function getRememberedEmailSnapshot() {
	return getRememberedEmail();
}

function getRememberedEmailServerSnapshot() {
	return "";
}

function getRememberEmailCheckedSnapshot() {
	return getRememberEmailChecked();
}

function getRememberEmailCheckedServerSnapshot() {
	return false;
}

export function useRememberedEmail() {
	return useSyncExternalStore(
		subscribeRememberEmail,
		getRememberedEmailSnapshot,
		getRememberedEmailServerSnapshot,
	);
}

export function useRememberEmailChecked() {
	return useSyncExternalStore(
		subscribeRememberEmail,
		getRememberEmailCheckedSnapshot,
		getRememberEmailCheckedServerSnapshot,
	);
}