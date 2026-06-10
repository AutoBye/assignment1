import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

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
 * <br> devtools 적용
 * */
export const usePostDraftStore = create<PostDraftStore>()(
  devtools(
    persist(
      (set) => ({
        title: "",
        content: "",

        setTitle: (title) =>
          set(
            {
              title,
            },
            false,
            "postDraft/setTitle",
          ),

        setContent: (content) =>
          set(
            {
              content,
            },
            false,
            "postDraft/setContent",
          ),

        resetDraft: () =>
          set(
            {
              title: "",
              content: "",
            },
            false,
            "postDraft/reset",
          ),
      }),
      {
        name: "post-write-draft",
      },
    ),
    {
      name: "post-draft-store",
    },
  ),
);
