import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tasks Voice",
  description: "Voice-powered task management application",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/navigation";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

// ... metadata

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Navigation />
        {children}
        <Toaster />
      </body>
    </html>
  );
}

