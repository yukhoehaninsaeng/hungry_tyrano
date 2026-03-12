import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://rabbithole.co.kr"),
  title: "토끼굴",
  description: "직장인이라면 다 아는 그 대화. 익명으로, 편하게.",
  icons: {
    icon: "/rabbit.svg"
  },
  openGraph: {
    type: "website",
    url: "https://rabbithole.co.kr",
    title: "토끼굴 — 직장인 익명 채팅",
    description: "직장인이라면 다 아는 그 대화. 익명으로, 편하게.",
    locale: "ko_KR",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "토끼굴 — 직장인 익명 채팅"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "토끼굴 — 직장인 익명 채팅",
    description: "직장인이라면 다 아는 그 대화. 익명으로, 편하게.",
    images: ["/og-image.svg"]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {children}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-Q07WGSEKJN" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-Q07WGSEKJN', { send_page_view: false });
          `}
        </Script>
      </body>
    </html>
  );
}
