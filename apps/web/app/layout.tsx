import type { Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  UserButton,
  Show,
} from "@clerk/nextjs";

import Link from "next/link";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "EdgeLink",
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
            <header className="border-b bg-background">
              <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-6">
                <Link href="/" className="font-semibold text-lg">
                  EdgeLink
                </Link>

                <div className="flex items-center gap-4">
                  <ThemeToggle />

                  <Show when="signed-out">
                    <SignInButton />
                    <SignUpButton />
                  </Show>

                  <Show when="signed-in">
                    <UserButton />
                  </Show>
                </div>
              </div>
            </header>

            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
