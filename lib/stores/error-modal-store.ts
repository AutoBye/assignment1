import { create } from "zustand";

//zustand 연습
type ErrorModalState = {
	isOpen: boolean;
	title: string;
	message: string;
	openErrorModal: (message: string, title?:string) => void;
	closeErrorModal: () => void;
};

export const useErrorModalStore = create<ErrorModalState>((set) => ({
	isOpen: false,
	title: "에러",
	message: "",

	openErrorModal: (message, title = "에러") =>
		set({
			isOpen: true,
			title,
			message,
		}),

	closeErrorModal: () =>
		set({
			isOpen: false,
			message: "",
		}),
}));