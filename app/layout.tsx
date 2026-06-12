import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import ErrorModal from "@/components/common/ErrorModal";
import ConfirmModal from "@/components/common/ConfirmModal";
import ToastViewport from "@/components/common/ToastViewport";
import QueryProvider from "@/components/providers/QueryProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "과제 게시판",
  description: "Next.js 게시판 과제 프로젝트",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={cn("h-full antialiased font-sans", inter.variable)}
    >
      <body className="flex min-h-full flex-col">
        <QueryProvider>
          {children}
          <ErrorModal />
          <ConfirmModal />
          <ToastViewport />
        </QueryProvider>
      </body>
    </html>
  );
}
