import type { ReactNode } from "react";
import AdSlot from "@/components/layout/AdSlot";

type PageShellProps = {
  children: ReactNode;
};

export default function PageShell({ children }: PageShellProps) {
  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 lg:px-6 xl:grid-cols-[160px_minmax(0,896px)_160px]">
      <AdSlot position="left" />

      <main className="min-w-0">{children}</main>

      <AdSlot position="right" />
    </div>
  );
}
