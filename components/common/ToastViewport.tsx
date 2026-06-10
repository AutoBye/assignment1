"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToastStore } from "@/lib/stores/toast-store";

const toastStyleByType = {
  success: "border-green-200 bg-green-50 text-green-950",
  error: "border-red-200 bg-red-50 text-red-950",
  info: "border-border bg-background text-foreground",
};

export default function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed right-6 bottom-6 z-50 flex w-96 max-w-[calc(100vw-2rem)] flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-md border p-4 text-base shadow-xl ${toastStyleByType[toast.type]}`}
        >
          <div className="flex items-start justify-between gap-4">
            <p className="leading-6">{toast.message}</p>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 shrink-0"
              onClick={() => removeToast(toast.id)}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
