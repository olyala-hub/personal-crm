import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { BookUser } from "lucide-react";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: {
    default: "Личная CRM",
    template: "%s · Личная CRM",
  },
  description: "Контакты людей, которых я знаю лично",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-muted/40">
        <header className="border-b bg-background">
          <div className="mx-auto flex h-14 w-full max-w-5xl items-center px-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold tracking-tight"
            >
              <BookUser className="size-5" aria-hidden />
              Личная CRM
            </Link>
          </div>
        </header>
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
