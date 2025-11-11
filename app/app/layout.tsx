import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LM Chat UI - Multi-Provider Chat Interface",
  description: "A full-featured chat UI with multi-provider and multi-model support",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
