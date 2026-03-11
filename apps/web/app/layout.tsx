import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "LinkScope",
  description: "Edge-native URL analytics platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en" suppressHydrationWarning>
        <body className="bg-background text-foreground">
          <ThemeProvider>
            <ToastProvider />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
