import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trekly — Kerja Asik, Hidup Santai",
  description: "Manajemen tugas dan proyek anti-ribet dengan papan Kanban interaktif, heatmap produktivitas, dan kolaborasi tim tanpa stres.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className="h-full antialiased scroll-smooth"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
