"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useErrorModalStore } from "@/lib/stores/error-modal-store";

export default function ErrorModal() {
  const isOpen = useErrorModalStore((state) => state.isOpen);
  const title = useErrorModalStore((state) => state.title);
  const message = useErrorModalStore((state) => state.message);
  const closeErrorModal = useErrorModalStore((state) => state.closeErrorModal);

  return (
    <Dialog open={isOpen} onOpenChange={closeErrorModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
