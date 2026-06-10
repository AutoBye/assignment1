//zustand 연습
import { create } from "zustand";

// devtools
import { devtools } from "zustand/middleware";

type ErrorModalState = {
  isOpen: boolean;
  title: string;
  message: string;
  openErrorModal: (message: string, title?: string) => void;
  closeErrorModal: () => void;
};

export const useErrorModalStore = create<ErrorModalState>()(
  devtools(
    (set) => ({
      isOpen: false,
      title: "오류",
      message: "",

      openErrorModal: (message, title = "오류") =>
        set(
          {
            isOpen: true,
            title,
            message,
          },
          false,
          "errorModal/open",
        ),

      closeErrorModal: () =>
        set(
          {
            isOpen: false,
            message: "",
          },
          false,
          "errorModal/close",
        ),
    }),
    {
      name: "error-modal-store",
    },
  ),
);
