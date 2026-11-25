import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Urbaniz — Smarter parking for Nairobi",
  description: "Verified parking discovery, partner onboarding, and urban mobility operations.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
