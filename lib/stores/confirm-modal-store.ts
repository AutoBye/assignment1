import { create } from "zustand";
import { devtools } from "zustand/middleware";

type ConfirmModalOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
};

type ConfirmModalState = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  resolve: ((confirmed: boolean) => void) | null;
  openConfirmModal: (options: ConfirmModalOptions) => Promise<boolean>;
  closeConfirmModal: () => void;
  confirm: () => void;
  cancel: () => void;
};

// 레전드로 기네 진짜
export const useConfirmModalStore = create<ConfirmModalState>()(
  devtools(
    (set, get) => ({
      isOpen: false,
      title: "확인",
      message: "",
      confirmText: "확인",
      cancelText: "취소",
      resolve: null,

      openConfirmModal: (options) =>
        new Promise<boolean>((resolve) => {
          set(
            {
              isOpen: true,
              title: options.title ?? "확인",
              message: options.message,
              confirmText: options.confirmText ?? "확인",
              cancelText: options.cancelText ?? "취소",
              resolve,
            },
            false,
            "confirmModal/open",
          );
        }),

      closeConfirmModal: () => {
        const resolve = get().resolve;

        resolve?.(false);

        set(
          {
            isOpen: false,
            message: "",
            resolve: null,
          },
          false,
          "confirmModal/close",
        );
      },

      confirm: () => {
        const resolve = get().resolve;

        resolve?.(true);

        set(
          {
            isOpen: false,
            message: "",
            resolve: null,
          },
          false,
          "confirmModal/confirm",
        );
      },

      cancel: () => {
        const resolve = get().resolve;

        resolve?.(false);

        set(
          {
            isOpen: false,
            message: "",
            resolve: null,
          },
          false,
          "confirmModal/cancel",
        );
      },
    }),
    {
      name: "confirm-modal-store",
    },
  ),
);
