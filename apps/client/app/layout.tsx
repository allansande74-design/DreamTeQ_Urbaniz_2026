import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./luxury-theme.css";
import ThemeToggle from "./theme-toggle";

const geistSans = localFont({ src: "./fonts/GeistVF.woff", variable: "--font-geist-sans" });
const geistMono = localFont({ src: "./fonts/GeistMonoVF.woff", variable: "--font-geist-mono" });
export const metadata: Metadata = {
  title: "Urbaniz — Find verified parking",
  description: "Find nearby parking, compare operator availability, and reserve a space.",
  applicationName: "Urbaniz",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Urbaniz" },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};
export const viewport: Viewport = { themeColor: "#f3efe5", width: "device-width", initialScale: 1, viewportFit: "cover" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${geistSans.variable} ${geistMono.variable}`}>{children}<ThemeToggle /><script src="/sw-register.js" defer /></body></html>;
}
