import { create } from "zustand";
import { devtools } from "zustand/middleware";

type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: string;
  type: ToastType;
  message: string;
};

type ToastOptions = {
  type?: ToastType;
  message: string;
};

type ToastState = {
  toasts: ToastItem[];
  showToast: (options: ToastOptions) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
};

export const useToastStore = create<ToastState>()(
  devtools(
    (set) => ({
      toasts: [],

      showToast: ({ type = "info", message }) => {
        const id = crypto.randomUUID();

        set(
          (state) => ({
            toasts: [
              ...state.toasts,
              {
                id,
                type,
                message,
              },
            ],
          }),
          false,
          "toast/show",
        );

        window.setTimeout(() => {
          set(
            (state) => ({
              toasts: state.toasts.filter((toast) => toast.id !== id),
            }),
            false,
            "toast/autoRemove",
          );
        }, 3000);
      },

      removeToast: (id) =>
        set(
          (state) => ({
            toasts: state.toasts.filter((toast) => toast.id !== id),
          }),
          false,
          "toast/remove",
        ),

      clearToasts: () =>
        set(
          {
            toasts: [],
          },
          false,
          "toast/clear",
        ),
    }),
    {
      name: "toast-store",
    },
  ),
);
