import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Hub — B2B software, honestly compared",
  description:
    "Editorial reviews and side-by-side comparisons of the software that runs serious businesses. No fake awards, no pay-to-rank.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" style={{ colorScheme: "light" }}>
      <body className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--fg)]">
        {children}
      </body>
    </html>
  );
}
