import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "배고픈 티라노 오픈채팅",
  description: "배고픈 티라노 컨셉의 오픈 채팅방 서비스"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
