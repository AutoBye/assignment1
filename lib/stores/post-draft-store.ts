import { create } from "zustand";
import { persist } from "zustand/middleware";

type PostDraftStore = {
	title: string;
	content: string;
	setTitle: (title: string) => void;
	setContent: (content: string) => void;
	resetDraft: () => void;
};

/** 게시글 작성 draft store
 * <br> persis(...) 그리고 name: "post-write-draft"
 * <br> 이 이름으로 localstorage에 저장
 * <br> 작성 성공 시 draft 초기화
 * */
export const usePostDraftStore = create<PostDraftStore>()(
	persist(
		(set) => ({
			title: "",
			content: "",

			setTitle: (title) => set({ title }),
			setContent: (content) => set({ content }),

			resetDraft: () =>
				set({
					title: "",
					content: "",
				}),
		}),
		{
			name: "post-write-draft",
		},
	),
);

