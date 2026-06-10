"use client";

import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useConfirmModalStore } from "@/lib/stores/confirm-modal-store";

export default function ConfirmModal() {
  const isOpen = useConfirmModalStore((state) => state.isOpen);
  const title = useConfirmModalStore((state) => state.title);
  const message = useConfirmModalStore((state) => state.message);
  const confirmText = useConfirmModalStore((state) => state.confirmText);
  const cancelText = useConfirmModalStore((state) => state.cancelText);
  const confirm = useConfirmModalStore((state) => state.confirm);
  const cancel = useConfirmModalStore((state) => state.cancel);

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && cancel()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{message}</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<Button type="button" variant="outline" onClick={cancel}>
						{cancelText}
					</Button>

					<Button type="button" variant="destructive" onClick={confirm}>
						{confirmText}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

