import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SSI Landing Page Sandbox",
  description: "Local development sandbox for Stevenson Systems landing pages.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
